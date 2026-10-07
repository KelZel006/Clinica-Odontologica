-- =====================================================================
-- Odontograma clínico: superficies completas, diagnóstico y tratamiento por hallazgo,
-- implantes con su ficha técnica, y correcciones por anulación (nunca se borra).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Superficies que faltaban (palatina para la arcada superior, incisal para anteriores)
-- ---------------------------------------------------------------------
alter type public.cara_dental add value if not exists 'palatina';
alter type public.cara_dental add value if not exists 'incisal';
alter type public.cara_dental add value if not exists 'cervical';
alter type public.cara_dental add value if not exists 'radicular';

-- ---------------------------------------------------------------------
-- Hallazgos: diagnóstico, tratamiento del catálogo, cita y anulación
-- ---------------------------------------------------------------------
alter table public.odontograma
  add column diagnostico      text,
  add column tratamiento_id   uuid references public.tratamientos(id),
  add column cita_id          uuid references public.citas(id) on delete set null,
  add column anulado          boolean not null default false,
  add column motivo_anulacion text,
  add column anulado_por      uuid references public.perfiles(id),
  add column anulado_at       timestamptz;

create index odontograma_vigentes_idx on public.odontograma (paciente_id, pieza, created_at)
  where not anulado;

-- Un hallazgo registrado no se edita: solo puede anularse (queda en el historial y en auditoría).
create or replace function public.odontograma_solo_anular()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.anulado then
    raise exception 'El hallazgo ya está anulado';
  end if;
  if (new.paciente_id, new.pieza, new.cara, new.condicion, new.estado, new.nota_id, new.observacion,
      new.diagnostico, new.tratamiento_id, new.cita_id, new.registrado_por, new.created_at)
     is distinct from
     (old.paciente_id, old.pieza, old.cara, old.condicion, old.estado, old.nota_id, old.observacion,
      old.diagnostico, old.tratamiento_id, old.cita_id, old.registrado_por, old.created_at) then
    raise exception 'Un hallazgo del odontograma no se modifica: anúlalo y registra uno nuevo';
  end if;
  if new.anulado then
    new.anulado_por := auth.uid();
    new.anulado_at := now();
  end if;
  return new;
end $$;

create trigger odontograma_solo_anular before update on public.odontograma
  for each row execute function public.odontograma_solo_anular();

drop policy if exists "borrar (expediente.editar)" on public.odontograma;

-- ---------------------------------------------------------------------
-- Implantes: ficha técnica de cada implante colocado
-- ---------------------------------------------------------------------
create table public.implantes (
  id               uuid primary key default gen_random_uuid(),
  paciente_id      uuid not null references public.pacientes(id) on delete cascade,
  pieza            smallint not null check (
                     (pieza / 10 between 1 and 4 and pieza % 10 between 1 and 8) or
                     (pieza / 10 between 5 and 8 and pieza % 10 between 1 and 5)),
  hallazgo_id      uuid references public.odontograma(id) on delete set null,
  marca            text,
  modelo           text,
  diametro_mm      numeric(4,2) check (diametro_mm > 0),
  longitud_mm      numeric(4,1) check (longitud_mm > 0),
  fecha_colocacion date,
  fecha_carga      date,
  observaciones    text,
  activo           boolean not null default true,
  registrado_por   uuid references public.perfiles(id) default auth.uid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (fecha_carga is null or fecha_colocacion is null or fecha_carga >= fecha_colocacion)
);
create index implantes_paciente_idx on public.implantes (paciente_id, pieza);

alter table public.implantes enable row level security;
create policy "leer (expediente.ver)" on public.implantes
  for select to authenticated using ((select public.tiene_permiso('expediente.ver')));
create policy "crear (expediente.editar)" on public.implantes
  for insert to authenticated with check ((select public.tiene_permiso('expediente.editar')));
create policy "editar (expediente.editar)" on public.implantes
  for update to authenticated
  using ((select public.tiene_permiso('expediente.editar')))
  with check ((select public.tiene_permiso('expediente.editar')));

create trigger implantes_updated_at before update on public.implantes
  for each row execute function public.set_updated_at();
create trigger implantes_auditoria after insert or update or delete on public.implantes
  for each row execute function public.registrar_auditoria();

-- ---------------------------------------------------------------------
-- Vista del estado actual (para consultas de n8n / IA): excluye anulados
-- ---------------------------------------------------------------------
drop view if exists public.v_odontograma_actual;
create view public.v_odontograma_actual with (security_invoker = true) as
select distinct on (o.paciente_id, o.pieza, o.cara)
  o.id,
  o.paciente_id,
  o.pieza,
  o.cara,
  o.condicion,
  o.estado,
  o.diagnostico,
  o.tratamiento_id,
  t.nombre as tratamiento,
  o.observacion,
  o.created_at as registrado_at
from public.odontograma o
left join public.tratamientos t on t.id = o.tratamiento_id
where not o.anulado
order by o.paciente_id, o.pieza, o.cara, o.created_at desc;

-- ---------------------------------------------------------------------
-- Nombres del personal para el historial clínico ("registrado por").
-- perfiles solo es legible por administración; esto expone únicamente id + nombre.
-- ---------------------------------------------------------------------
create or replace function public.nombres_personal(p_ids uuid[])
returns table (id uuid, nombre text)
language sql
stable
security definer
set search_path = ''
as $$
  select pf.id, coalesce(nullif(pf.nombre_completo, ''), pf.correo, 'Usuario')
  from public.perfiles pf
  where pf.id = any(p_ids)
    and (select public.tiene_permiso('dashboard.ver'));
$$;

revoke execute on function public.nombres_personal(uuid[]) from public, anon;
grant  execute on function public.nombres_personal(uuid[]) to authenticated, service_role;
revoke execute on function public.odontograma_solo_anular() from public, anon, authenticated;
