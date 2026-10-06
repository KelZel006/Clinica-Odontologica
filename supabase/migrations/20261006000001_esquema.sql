-- =====================================================================
-- Clínica Odontológica Dr. Elías Renato Chirinos — Esquema
-- Zona horaria de la clínica: America/Tegucigalpa (UTC-6, sin horario de verano)
-- Moneda: Lempiras (HNL)
-- =====================================================================

create extension if not exists btree_gist with schema extensions;   -- evita citas solapadas

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.estado_cita as enum (
  'pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio', 'reprogramada'
);
create type public.estado_solicitud as enum ('nueva', 'contactada', 'agendada', 'descartada');
create type public.estado_plan as enum ('propuesto', 'aceptado', 'en_curso', 'finalizado', 'rechazado');
create type public.estado_cuota as enum ('pendiente', 'parcial', 'pagada', 'vencida', 'anulada');
create type public.frecuencia_pago as enum ('semanal', 'quincenal', 'mensual');
create type public.metodo_pago as enum ('efectivo', 'tarjeta', 'transferencia', 'otro');
create type public.direccion_mensaje as enum ('entrante', 'saliente');
create type public.cara_dental as enum ('oclusal', 'mesial', 'distal', 'vestibular', 'lingual', 'completa');
create type public.condicion_dental as enum (
  'sano', 'caries', 'obturado', 'ausente', 'extraccion_indicada', 'endodoncia',
  'corona', 'implante', 'puente', 'protesis', 'fractura', 'sellante', 'otro'
);
create type public.estado_hallazgo as enum ('existente', 'planificado', 'realizado');

-- ---------------------------------------------------------------------
-- Utilidad: updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- =====================================================================
-- USUARIOS, ROLES Y PERMISOS
-- =====================================================================
create table public.roles (
  id          smallint generated always as identity primary key,
  nombre      text not null unique,
  descripcion text
);

create table public.permisos (
  codigo      text primary key,          -- p. ej. 'pacientes.ver'
  descripcion text not null
);

create table public.rol_permisos (
  rol_id  smallint not null references public.roles(id) on delete cascade,
  permiso text     not null references public.permisos(codigo) on delete cascade,
  primary key (rol_id, permiso)
);

-- Un perfil por cada usuario de Supabase Auth. Se crea solo al registrarse
-- (ver trigger en la migración de seguridad) y SIN rol: un administrador lo asigna.
create table public.perfiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null default '',
  correo          text,
  telefono        text,
  rol_id          smallint references public.roles(id),
  activo          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =====================================================================
-- AGENDA
-- =====================================================================
create table public.doctores (
  id           uuid primary key default gen_random_uuid(),
  perfil_id    uuid unique references public.perfiles(id) on delete set null,
  nombre       text not null,
  especialidad text,
  telefono     text,
  correo       text,
  activo       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.tratamientos (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  nombre            text not null unique,
  descripcion       text,
  categoria         text,
  duracion_minutos  int not null default 30 check (duracion_minutos > 0),
  precio_referencia numeric(12,2) check (precio_referencia >= 0),
  visible_web       boolean not null default true,
  activo            boolean not null default true,
  orden             int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- dia_semana: 0 = domingo … 6 = sábado (igual que extract(dow))
create table public.horarios_atencion (
  id          uuid primary key default gen_random_uuid(),
  doctor_id   uuid not null references public.doctores(id) on delete cascade,
  dia_semana  smallint not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin    time not null,
  check (hora_fin > hora_inicio),
  unique (doctor_id, dia_semana, hora_inicio)
);

create table public.bloqueos_agenda (
  id         uuid primary key default gen_random_uuid(),
  doctor_id  uuid not null references public.doctores(id) on delete cascade,
  inicio     timestamptz not null,
  fin        timestamptz not null,
  motivo     text,
  creado_por uuid references public.perfiles(id) default auth.uid(),
  created_at timestamptz not null default now(),
  check (fin > inicio)
);
create index bloqueos_agenda_rango_idx on public.bloqueos_agenda using gist (doctor_id, tstzrange(inicio, fin));

-- =====================================================================
-- PACIENTES Y EXPEDIENTE
-- =====================================================================
create table public.pacientes (
  id                    uuid primary key default gen_random_uuid(),
  numero_expediente     int generated always as identity unique,
  nombre_completo       text not null,
  telefono              text not null unique,   -- E.164: +50499998888
  correo                text,
  fecha_nacimiento      date,
  sexo                  text check (sexo in ('F', 'M', 'otro')),
  identidad             text unique,            -- DNI hondureño
  ocupacion             text,
  direccion             text,
  contacto_emergencia   text,
  telefono_emergencia   text,
  alergias              text,
  antecedentes_medicos  text,
  medicamentos_actuales text,
  origen                text not null default 'web',
  notas                 text,
  activo                boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index pacientes_nombre_idx on public.pacientes (lower(nombre_completo));

create table public.solicitudes_cita (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null,
  telefono          text not null,
  correo            text,
  motivo            text,
  tratamiento_id    uuid references public.tratamientos(id),
  fecha_preferida   date,
  horario_preferido text,
  estado            public.estado_solicitud not null default 'nueva',
  paciente_id       uuid references public.pacientes(id) on delete set null,
  cita_id           uuid,
  origen            text not null default 'web_chat',
  datos_crudos      jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index solicitudes_cita_estado_idx on public.solicitudes_cita (estado, created_at desc);
create index solicitudes_cita_telefono_idx on public.solicitudes_cita (telefono);

create table public.citas (
  id                      uuid primary key default gen_random_uuid(),
  paciente_id             uuid not null references public.pacientes(id) on delete restrict,
  doctor_id               uuid not null references public.doctores(id) on delete restrict,
  tratamiento_id          uuid references public.tratamientos(id),
  inicio                  timestamptz not null,
  fin                     timestamptz not null,
  estado                  public.estado_cita not null default 'pendiente',
  motivo                  text,
  notas                   text,
  origen                  text not null default 'sistema',
  recordatorio_enviado_at timestamptz,
  confirmada_at           timestamptz,
  cancelada_at            timestamptz,
  motivo_cancelacion      text,
  reprogramada_de         uuid references public.citas(id) on delete set null,
  creado_por              uuid references public.perfiles(id) default auth.uid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (fin > inicio),
  constraint citas_sin_solapamiento exclude using gist (
    doctor_id with =,
    tstzrange(inicio, fin) with &&
  ) where (estado in ('pendiente', 'confirmada'))
);
create index citas_paciente_idx on public.citas (paciente_id, inicio desc);
create index citas_doctor_inicio_idx on public.citas (doctor_id, inicio);
create index citas_recordatorio_idx on public.citas (inicio)
  where estado in ('pendiente', 'confirmada') and recordatorio_enviado_at is null;

alter table public.solicitudes_cita
  add constraint solicitudes_cita_cita_fk foreign key (cita_id) references public.citas(id) on delete set null;

create table public.notas_clinicas (
  id                      uuid primary key default gen_random_uuid(),
  paciente_id             uuid not null references public.pacientes(id) on delete cascade,
  cita_id                 uuid references public.citas(id) on delete set null,
  doctor_id               uuid references public.doctores(id),
  motivo_consulta         text,
  diagnostico             text,
  procedimiento_realizado text,
  piezas_dentales         smallint[],
  indicaciones            text,
  creado_por              uuid references public.perfiles(id) default auth.uid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index notas_clinicas_paciente_idx on public.notas_clinicas (paciente_id, created_at desc);

-- Odontograma: cada fila es un hallazgo en una pieza (y cara) en una fecha.
-- Se conserva el historial; el estado actual está en v_odontograma_actual.
-- Numeración FDI: permanentes 11–18, 21–28, 31–38, 41–48; temporales 51–55 … 81–85.
create table public.odontograma (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes(id) on delete cascade,
  pieza        smallint not null check (
                 (pieza / 10 between 1 and 4 and pieza % 10 between 1 and 8) or
                 (pieza / 10 between 5 and 8 and pieza % 10 between 1 and 5)),
  cara         public.cara_dental not null default 'completa',
  condicion    public.condicion_dental not null,
  estado       public.estado_hallazgo not null default 'existente',
  nota_id      uuid references public.notas_clinicas(id) on delete set null,
  observacion  text,
  registrado_por uuid references public.perfiles(id) default auth.uid(),
  created_at   timestamptz not null default now()
);
create index odontograma_paciente_idx on public.odontograma (paciente_id, pieza, cara, created_at desc);

-- Radiografías, tomografías, fotos, consentimientos (archivo en Storage, bucket "expedientes")
create table public.archivos_paciente (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes(id) on delete cascade,
  nota_id      uuid references public.notas_clinicas(id) on delete set null,
  tipo         text not null check (tipo in ('radiografia', 'tomografia', 'foto', 'consentimiento', 'otro')),
  storage_path text not null unique,   -- '<paciente_id>/<archivo>'
  descripcion  text,
  subido_por   uuid references public.perfiles(id) default auth.uid(),
  created_at   timestamptz not null default now()
);
create index archivos_paciente_idx on public.archivos_paciente (paciente_id);

-- =====================================================================
-- FINANZAS (Lempiras)
-- =====================================================================
create table public.planes_tratamiento (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes(id) on delete cascade,
  doctor_id    uuid references public.doctores(id),
  titulo       text not null,
  estado       public.estado_plan not null default 'propuesto',
  descuento    numeric(12,2) not null default 0 check (descuento >= 0),
  notas        text,
  aceptado_at  timestamptz,
  creado_por   uuid references public.perfiles(id) default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index planes_tratamiento_paciente_idx on public.planes_tratamiento (paciente_id);

create table public.plan_items (
  id              uuid primary key default gen_random_uuid(),
  plan_id         uuid not null references public.planes_tratamiento(id) on delete cascade,
  tratamiento_id  uuid references public.tratamientos(id),
  descripcion     text not null,
  pieza           smallint,
  cantidad        int not null default 1 check (cantidad > 0),
  precio_unitario numeric(12,2) not null check (precio_unitario >= 0),
  completado      boolean not null default false,
  orden           int not null default 0
);
create index plan_items_plan_idx on public.plan_items (plan_id);

-- Plan de pago: cómo se financia un plan de tratamiento
create table public.planes_pago (
  id                 uuid primary key default gen_random_uuid(),
  plan_tratamiento_id uuid not null references public.planes_tratamiento(id) on delete cascade,
  monto_total        numeric(12,2) not null check (monto_total > 0),
  prima              numeric(12,2) not null default 0 check (prima >= 0),   -- pago inicial
  numero_cuotas      int not null check (numero_cuotas > 0),
  frecuencia         public.frecuencia_pago not null default 'mensual',
  fecha_inicio       date not null,
  activo             boolean not null default true,
  notas              text,
  creado_por         uuid references public.perfiles(id) default auth.uid(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (prima < monto_total)
);
create index planes_pago_plan_idx on public.planes_pago (plan_tratamiento_id);

create table public.cuotas (
  id                uuid primary key default gen_random_uuid(),
  plan_pago_id      uuid not null references public.planes_pago(id) on delete cascade,
  numero            int not null check (numero > 0),
  fecha_vencimiento date not null,
  monto             numeric(12,2) not null check (monto > 0),
  estado            public.estado_cuota not null default 'pendiente',
  unique (plan_pago_id, numero)
);
create index cuotas_vencimiento_idx on public.cuotas (fecha_vencimiento) where estado in ('pendiente', 'parcial');

-- Abonos: todo dinero recibido. Puede ir a una cuota, a un plan o ser un pago suelto.
create table public.abonos (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes(id) on delete restrict,
  plan_tratamiento_id uuid references public.planes_tratamiento(id) on delete set null,
  cuota_id     uuid references public.cuotas(id) on delete set null,
  cita_id      uuid references public.citas(id) on delete set null,
  monto        numeric(12,2) not null check (monto > 0),
  metodo       public.metodo_pago not null,
  referencia   text,
  recibo_numero int generated always as identity unique,
  pagado_at    timestamptz not null default now(),
  notas        text,
  anulado      boolean not null default false,
  motivo_anulacion text,
  recibido_por uuid references public.perfiles(id) default auth.uid(),
  created_at   timestamptz not null default now()
);
create index abonos_paciente_idx on public.abonos (paciente_id, pagado_at desc);
create index abonos_plan_idx on public.abonos (plan_tratamiento_id);
create index abonos_cuota_idx on public.abonos (cuota_id);

-- Un abono a una cuota cuenta también para el saldo de su plan de tratamiento
create or replace function public.abono_completar_plan()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.cuota_id is not null then
    select pp.plan_tratamiento_id into new.plan_tratamiento_id
    from public.cuotas c
    join public.planes_pago pp on pp.id = c.plan_pago_id
    where c.id = new.cuota_id;
  end if;
  return new;
end $$;

create trigger abonos_completar_plan before insert or update of cuota_id on public.abonos
  for each row execute function public.abono_completar_plan();

-- =====================================================================
-- COMUNICACIÓN Y WEB
-- =====================================================================
create table public.mensajes_whatsapp (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid references public.pacientes(id) on delete set null,
  cita_id      uuid references public.citas(id) on delete set null,
  telefono     text not null,
  direccion    public.direccion_mensaje not null,
  tipo         text not null default 'texto',
  contenido    text,
  proveedor_id text unique,
  estado_envio text,
  created_at   timestamptz not null default now()
);
create index mensajes_whatsapp_telefono_idx on public.mensajes_whatsapp (telefono, created_at desc);

create table public.casos_clinicos (
  id                         uuid primary key default gen_random_uuid(),
  titulo                     text not null,
  descripcion                text,
  tratamiento_id             uuid references public.tratamientos(id),
  imagen_antes               text,   -- ruta en el bucket público "web"
  imagen_despues             text,
  paciente_id                uuid references public.pacientes(id) on delete set null,
  consentimiento_publicacion boolean not null default false,
  publicado                  boolean not null default false,
  orden                      int not null default 0,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  check (not publicado or consentimiento_publicacion)
);

-- =====================================================================
-- AUDITORÍA
-- =====================================================================
create table public.auditoria (
  id               bigint generated always as identity primary key,
  tabla            text not null,
  registro_id      text,
  accion           text not null check (accion in ('INSERT', 'UPDATE', 'DELETE')),
  datos_anteriores jsonb,
  datos_nuevos     jsonb,
  usuario_id       uuid,           -- auth.uid(); null si vino de n8n / service_role
  rol_db           text not null default current_user,
  created_at       timestamptz not null default now()
);
create index auditoria_tabla_idx on public.auditoria (tabla, registro_id, created_at desc);
create index auditoria_usuario_idx on public.auditoria (usuario_id, created_at desc);

create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
begin
  if tg_op = 'UPDATE' and v_old = v_new then
    return new;
  end if;
  insert into public.auditoria (tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id, rol_db)
  values (tg_table_name, coalesce(v_new, v_old) ->> 'id', tg_op, v_old, v_new, auth.uid(), session_user);
  return coalesce(new, old);
end $$;

-- =====================================================================
-- Triggers
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'perfiles', 'doctores', 'tratamientos', 'pacientes', 'solicitudes_cita', 'citas',
    'notas_clinicas', 'planes_tratamiento', 'planes_pago', 'casos_clinicos'
  ] loop
    execute format(
      'create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t, t);
  end loop;

  foreach t in array array[
    'perfiles', 'roles', 'rol_permisos', 'doctores', 'tratamientos', 'horarios_atencion', 'bloqueos_agenda',
    'pacientes', 'citas', 'notas_clinicas', 'odontograma', 'archivos_paciente',
    'planes_tratamiento', 'plan_items', 'planes_pago', 'cuotas', 'abonos', 'casos_clinicos'
  ] loop
    execute format(
      'create trigger %I_auditoria after insert or update or delete on public.%I for each row execute function public.registrar_auditoria()',
      t, t);
  end loop;
end $$;

-- =====================================================================
-- Vistas (security_invoker: respetan el RLS de quien consulta)
-- =====================================================================
create view public.v_agenda with (security_invoker = true) as
select
  c.id as cita_id,
  c.inicio,
  c.fin,
  (c.inicio at time zone 'America/Tegucigalpa') as inicio_local,
  c.estado,
  d.id as doctor_id,
  d.nombre as doctor,
  t.nombre as tratamiento,
  pa.id as paciente_id,
  pa.nombre_completo as paciente,
  pa.telefono,
  c.recordatorio_enviado_at
from public.citas c
join public.pacientes pa on pa.id = c.paciente_id
join public.doctores d on d.id = c.doctor_id
left join public.tratamientos t on t.id = c.tratamiento_id;

create view public.v_odontograma_actual with (security_invoker = true) as
select distinct on (paciente_id, pieza, cara)
  paciente_id, pieza, cara, condicion, estado, observacion, created_at as registrado_at
from public.odontograma
order by paciente_id, pieza, cara, created_at desc;

create view public.v_saldo_planes with (security_invoker = true) as
select
  p.id as plan_id,
  p.paciente_id,
  p.titulo,
  p.estado,
  coalesce(i.subtotal, 0) - p.descuento as total,
  coalesce(a.pagado, 0) as pagado,
  coalesce(i.subtotal, 0) - p.descuento - coalesce(a.pagado, 0) as saldo
from public.planes_tratamiento p
left join (select plan_id, sum(cantidad * precio_unitario) as subtotal from public.plan_items group by plan_id) i
  on i.plan_id = p.id
left join (select plan_tratamiento_id, sum(monto) as pagado from public.abonos where not anulado group by plan_tratamiento_id) a
  on a.plan_tratamiento_id = p.id;

create view public.v_cuotas_estado with (security_invoker = true) as
select
  cu.id as cuota_id,
  cu.plan_pago_id,
  pp.plan_tratamiento_id,
  pt.paciente_id,
  cu.numero,
  cu.fecha_vencimiento,
  cu.monto,
  coalesce(a.pagado, 0) as pagado,
  cu.monto - coalesce(a.pagado, 0) as pendiente,
  case
    when cu.estado = 'anulada' then 'anulada'
    when coalesce(a.pagado, 0) >= cu.monto then 'pagada'
    when cu.fecha_vencimiento < (now() at time zone 'America/Tegucigalpa')::date then 'vencida'
    when coalesce(a.pagado, 0) > 0 then 'parcial'
    else 'pendiente'
  end as estado_calculado
from public.cuotas cu
join public.planes_pago pp on pp.id = cu.plan_pago_id
join public.planes_tratamiento pt on pt.id = pp.plan_tratamiento_id
left join (select cuota_id, sum(monto) as pagado from public.abonos where not anulado group by cuota_id) a
  on a.cuota_id = cu.id;

-- =====================================================================
-- Funciones de negocio
-- =====================================================================

-- Horarios libres para una fecha. Uso: select * from horarios_disponibles('2026-10-12', 'valoracion-implantes');
-- REST: POST /rest/v1/rpc/horarios_disponibles {"p_fecha":"2026-10-12","p_tratamiento_slug":"valoracion-implantes"}
create or replace function public.horarios_disponibles(
  p_fecha            date,
  p_tratamiento_slug text default null,
  p_doctor_id        uuid default null,
  p_intervalo_min    int  default 30
)
returns table (doctor_id uuid, doctor text, inicio timestamptz, fin timestamptz, hora_local time)
language sql
stable
set search_path = ''
as $$
  with params as (
    select make_interval(mins => coalesce(
      (select t.duracion_minutos from public.tratamientos t where t.slug = p_tratamiento_slug), 30)) as duracion
  ),
  franjas as (
    select h.doctor_id, d.nombre as doctor,
           (p_fecha + h.hora_inicio) at time zone 'America/Tegucigalpa' as desde,
           (p_fecha + h.hora_fin)    at time zone 'America/Tegucigalpa' as hasta
    from public.horarios_atencion h
    join public.doctores d on d.id = h.doctor_id and d.activo
    where h.dia_semana = extract(dow from p_fecha)
      and (p_doctor_id is null or h.doctor_id = p_doctor_id)
  ),
  candidatos as (
    select f.doctor_id, f.doctor, s as inicio, s + params.duracion as fin
    from franjas f, params,
         generate_series(f.desde, f.hasta - params.duracion, make_interval(mins => p_intervalo_min)) s
  )
  select c.doctor_id, c.doctor, c.inicio, c.fin,
         (c.inicio at time zone 'America/Tegucigalpa')::time as hora_local
  from candidatos c
  where c.inicio > now()
    and not exists (
      select 1 from public.citas ci
      where ci.doctor_id = c.doctor_id
        and ci.estado in ('pendiente', 'confirmada')
        and tstzrange(ci.inicio, ci.fin) && tstzrange(c.inicio, c.fin))
    and not exists (
      select 1 from public.bloqueos_agenda b
      where b.doctor_id = c.doctor_id
        and tstzrange(b.inicio, b.fin) && tstzrange(c.inicio, c.fin))
  order by c.inicio;
$$;

-- Genera las cuotas de un plan de pago a partir de monto, prima, número y frecuencia.
-- La última cuota absorbe los centavos de redondeo.
create or replace function public.generar_cuotas(p_plan_pago_id uuid)
returns setof public.cuotas
language plpgsql
set search_path = ''
as $$
declare
  pp     public.planes_pago;
  base   numeric(12,2);
  paso   interval;
begin
  select * into strict pp from public.planes_pago where id = p_plan_pago_id;
  if exists (select 1 from public.cuotas where plan_pago_id = p_plan_pago_id) then
    raise exception 'El plan de pago % ya tiene cuotas', p_plan_pago_id;
  end if;

  base := trunc((pp.monto_total - pp.prima) / pp.numero_cuotas, 2);
  paso := case pp.frecuencia
            when 'semanal'   then interval '1 week'
            when 'quincenal' then interval '15 days'
            else interval '1 month'
          end;

  return query
  insert into public.cuotas (plan_pago_id, numero, fecha_vencimiento, monto)
  select pp.id, n,
         (pp.fecha_inicio + paso * (n - 1))::date,
         case when n = pp.numero_cuotas
              then (pp.monto_total - pp.prima) - base * (pp.numero_cuotas - 1)
              else base end
  from generate_series(1, pp.numero_cuotas) n
  returning *;
end $$;
