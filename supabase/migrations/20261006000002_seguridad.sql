-- =====================================================================
-- Seguridad: permisos por rol + Row Level Security
--
-- Quién accede a qué:
--   anon (web pública)      → solo tratamientos visibles y casos clínicos publicados
--   authenticated (personal) → según los permisos de su rol (tabla rol_permisos)
--   service_role (n8n)       → todo; ignora RLS. Nunca exponer esa clave en un navegador.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Catálogo de permisos y roles iniciales
-- ---------------------------------------------------------------------
insert into public.permisos (codigo, descripcion) values
  ('dashboard.ver',        'Ver el dashboard y estadísticas'),
  ('pacientes.ver',        'Ver datos generales de pacientes'),
  ('pacientes.editar',     'Crear y editar pacientes'),
  ('pacientes.eliminar',   'Eliminar pacientes'),
  ('expediente.ver',       'Ver expediente clínico: notas, odontograma, archivos, planes'),
  ('expediente.editar',    'Escribir en el expediente clínico'),
  ('citas.ver',            'Ver agenda, citas y solicitudes'),
  ('citas.editar',         'Crear, mover y cancelar citas; gestionar solicitudes'),
  ('agenda.configurar',    'Configurar doctores, horarios de atención y bloqueos'),
  ('tratamientos.editar',  'Editar el catálogo de tratamientos y precios'),
  ('finanzas.ver',         'Ver planes de pago, cuotas y abonos'),
  ('finanzas.editar',      'Registrar abonos y crear planes de pago'),
  ('usuarios.administrar', 'Gestionar usuarios, roles y permisos'),
  ('auditoria.ver',        'Ver el registro de auditoría');

insert into public.roles (nombre, descripcion) values
  ('administrador', 'Acceso total'),
  ('doctor',        'Atención clínica: expediente, odontograma y agenda'),
  ('recepcion',     'Agenda, registro de pacientes y cobros'),
  ('contabilidad',  'Módulo financiero');

insert into public.rol_permisos (rol_id, permiso)
select r.id, p.codigo
from public.roles r
join public.permisos p on case r.nombre
  when 'administrador' then true
  when 'doctor' then p.codigo in (
    'dashboard.ver', 'pacientes.ver', 'pacientes.editar', 'expediente.ver', 'expediente.editar',
    'citas.ver', 'citas.editar', 'finanzas.ver')
  when 'recepcion' then p.codigo in (
    'dashboard.ver', 'pacientes.ver', 'pacientes.editar', 'citas.ver', 'citas.editar',
    'finanzas.ver', 'finanzas.editar')
  when 'contabilidad' then p.codigo in (
    'dashboard.ver', 'pacientes.ver', 'finanzas.ver', 'finanzas.editar', 'auditoria.ver')
end;

-- ---------------------------------------------------------------------
-- tiene_permiso(): ¿el usuario de la sesión tiene este permiso?
-- security definer para poder leer perfiles/rol_permisos sin chocar con su propio RLS.
-- ---------------------------------------------------------------------
create or replace function public.tiene_permiso(p_permiso text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfiles pf
    join public.rol_permisos rp on rp.rol_id = pf.rol_id
    where pf.id = (select auth.uid())
      and pf.activo
      and rp.permiso = p_permiso
  );
$$;

-- Permisos del usuario actual (para que la app muestre/oculte menús)
create or replace function public.mis_permisos()
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select rp.permiso
  from public.perfiles pf
  join public.rol_permisos rp on rp.rol_id = pf.rol_id
  where pf.id = (select auth.uid()) and pf.activo;
$$;

-- ---------------------------------------------------------------------
-- Perfil automático al crear un usuario en Supabase Auth (sin rol)
-- ---------------------------------------------------------------------
create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre_completo, correo)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre_completo', ''), new.email);
  return new;
end $$;

create trigger crear_perfil_al_registrarse
  after insert on auth.users
  for each row execute function public.crear_perfil_usuario();

-- ---------------------------------------------------------------------
-- RLS en todas las tablas
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Políticas estándar: SELECT con permiso "ver", escritura con permiso "editar".
-- (tabla, permiso para leer, permiso para escribir, permiso para borrar)
do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('doctores',           'citas.ver',      'agenda.configurar',   'agenda.configurar'),
      ('horarios_atencion',  'citas.ver',      'agenda.configurar',   'agenda.configurar'),
      ('bloqueos_agenda',    'citas.ver',      'agenda.configurar',   'agenda.configurar'),
      ('pacientes',          'pacientes.ver',  'pacientes.editar',    'pacientes.eliminar'),
      ('solicitudes_cita',   'citas.ver',      'citas.editar',        'citas.editar'),
      ('citas',              'citas.ver',      'citas.editar',        'citas.editar'),
      ('notas_clinicas',     'expediente.ver', 'expediente.editar',   'expediente.editar'),
      ('odontograma',        'expediente.ver', 'expediente.editar',   'expediente.editar'),
      ('archivos_paciente',  'expediente.ver', 'expediente.editar',   'expediente.editar'),
      ('planes_tratamiento', 'expediente.ver', 'expediente.editar',   'expediente.editar'),
      ('plan_items',         'expediente.ver', 'expediente.editar',   'expediente.editar'),
      ('planes_pago',        'finanzas.ver',   'finanzas.editar',     'finanzas.editar'),
      ('cuotas',             'finanzas.ver',   'finanzas.editar',     'finanzas.editar'),
      ('abonos',             'finanzas.ver',   'finanzas.editar',     'usuarios.administrar'),
      ('mensajes_whatsapp',  'citas.ver',      'citas.editar',        'usuarios.administrar'),
      ('casos_clinicos',     'expediente.ver', 'expediente.editar',   'expediente.editar'),
      ('tratamientos',       'citas.ver',      'tratamientos.editar', 'tratamientos.editar'),
      ('roles',              'dashboard.ver',  'usuarios.administrar','usuarios.administrar'),
      ('permisos',           'dashboard.ver',  'usuarios.administrar','usuarios.administrar'),
      ('rol_permisos',       'dashboard.ver',  'usuarios.administrar','usuarios.administrar')
    ) as v(tabla, ver, editar, borrar)
  loop
    execute format('create policy "leer (%s)" on public.%I for select to authenticated using ((select public.tiene_permiso(%L)))',
                   r.ver, r.tabla, r.ver);
    execute format('create policy "crear (%s)" on public.%I for insert to authenticated with check ((select public.tiene_permiso(%L)))',
                   r.editar, r.tabla, r.editar);
    execute format('create policy "editar (%s)" on public.%I for update to authenticated using ((select public.tiene_permiso(%L))) with check ((select public.tiene_permiso(%L)))',
                   r.editar, r.tabla, r.editar, r.editar);
    execute format('create policy "borrar (%s)" on public.%I for delete to authenticated using ((select public.tiene_permiso(%L)))',
                   r.borrar, r.tabla, r.borrar);
  end loop;
end $$;

-- Planes de tratamiento: finanzas también necesita verlos para cobrar
create policy "leer (finanzas.ver)" on public.planes_tratamiento
  for select to authenticated using ((select public.tiene_permiso('finanzas.ver')));
create policy "leer (finanzas.ver)" on public.plan_items
  for select to authenticated using ((select public.tiene_permiso('finanzas.ver')));

-- Web pública
create policy "web: tratamientos visibles" on public.tratamientos
  for select to anon using (activo and visible_web);
create policy "web: casos publicados" on public.casos_clinicos
  for select to anon using (publicado);

-- Perfiles: cada quien ve el suyo; solo administración ve y modifica todos.
-- Nadie puede cambiarse su propio rol (no hay política de update para uno mismo).
create policy "ver mi perfil" on public.perfiles
  for select to authenticated using (id = (select auth.uid()));
create policy "admin: ver perfiles" on public.perfiles
  for select to authenticated using ((select public.tiene_permiso('usuarios.administrar')));
create policy "admin: editar perfiles" on public.perfiles
  for update to authenticated
  using ((select public.tiene_permiso('usuarios.administrar')))
  with check ((select public.tiene_permiso('usuarios.administrar')));

-- Auditoría: solo lectura y solo con permiso. Se escribe únicamente por trigger.
create policy "leer auditoría" on public.auditoria
  for select to authenticated using ((select public.tiene_permiso('auditoria.ver')));
revoke insert, update, delete, truncate on public.auditoria from anon, authenticated;

-- ---------------------------------------------------------------------
-- Funciones: quitar el EXECUTE público por defecto
-- ---------------------------------------------------------------------
revoke execute on function public.horarios_disponibles(date, text, uuid, int) from public, anon;
grant  execute on function public.horarios_disponibles(date, text, uuid, int) to authenticated, service_role;

revoke execute on function public.generar_cuotas(uuid) from public, anon;
grant  execute on function public.generar_cuotas(uuid) to authenticated, service_role;

revoke execute on function public.tiene_permiso(text) from public, anon;
grant  execute on function public.tiene_permiso(text) to authenticated, service_role;

revoke execute on function public.mis_permisos() from public, anon;
grant  execute on function public.mis_permisos() to authenticated, service_role;

revoke execute on function public.crear_perfil_usuario() from public, anon, authenticated;
revoke execute on function public.registrar_auditoria() from public, anon, authenticated;
