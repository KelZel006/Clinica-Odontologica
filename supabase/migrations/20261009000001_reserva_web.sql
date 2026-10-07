-- =====================================================================
-- Reserva de citas desde la landing pública (clinica-chirinos).
-- La página llama a estas funciones con la clave pública (anon). Solo ven y hacen
-- lo estrictamente necesario: listar servicios reservables, ver horas libres y
-- reservar una cita «por confirmar». Todo lo demás sigue cerrado por RLS.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Qué se puede reservar desde la web (distinto de «visible en la web»)
-- ---------------------------------------------------------------------
alter table public.tratamientos
  add column reservable_web boolean not null default false;

update public.tratamientos set reservable_web = true where slug = 'valoracion-implantes';

insert into public.tratamientos (slug, nombre, categoria, descripcion, duracion_minutos, visible_web, reservable_web, orden) values
  ('revision-general', 'Revisión dental',  'General', 'Revisión y diagnóstico general de tu salud bucal.', 30, true, true, 6),
  ('limpieza-dental',  'Limpieza dental',  'General', 'Profilaxis y eliminación de sarro.',               45, true, true, 7),
  ('extraccion',       'Extracción dental','General', 'Extracción de una pieza dental.',                  45, true, true, 8)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- 1. Servicios que se pueden reservar
-- ---------------------------------------------------------------------
create or replace function public.web_servicios()
returns table (slug text, nombre text, descripcion text, duracion_minutos int)
language sql
stable
security definer
set search_path = ''
as $$
  select t.slug, t.nombre, t.descripcion, t.duracion_minutos
  from public.tratamientos t
  where t.activo and t.reservable_web
  order by t.orden, t.nombre;
$$;

-- ---------------------------------------------------------------------
-- 2. Horas libres de un día para un servicio (hasta 60 días adelante)
-- ---------------------------------------------------------------------
create or replace function public.web_horarios(p_fecha date, p_servicio text)
returns table (inicio timestamptz, hora_local time)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct on (h.inicio) h.inicio, h.hora_local
  from public.horarios_disponibles(p_fecha, p_servicio) h
  where exists (select 1 from public.tratamientos t where t.slug = p_servicio and t.activo and t.reservable_web)
    and p_fecha between (now() at time zone 'America/Tegucigalpa')::date
                    and (now() at time zone 'America/Tegucigalpa')::date + 60
  order by h.inicio;
$$;

-- ---------------------------------------------------------------------
-- 3. Reservar: crea (o reutiliza) el paciente por teléfono y la cita «pendiente».
--    Devuelve JSON: { ok, mensaje, cita_id?, inicio? }
-- ---------------------------------------------------------------------
create or replace function public.web_reservar_cita(
  p_nombre   text,
  p_telefono text,
  p_servicio text,
  p_inicio   timestamptz,
  p_correo   text default null,
  p_motivo   text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nombre    text := btrim(regexp_replace(coalesce(p_nombre, ''), '\s+', ' ', 'g'));
  v_digitos   text := regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g');
  v_telefono  text;
  v_correo    text := nullif(lower(btrim(coalesce(p_correo, ''))), '');
  v_motivo    text := nullif(left(btrim(coalesce(p_motivo, '')), 500), '');
  v_trat      public.tratamientos;
  v_fecha     date := (p_inicio at time zone 'America/Tegucigalpa')::date;
  v_doctor    uuid;
  v_paciente  uuid;
  v_cita      uuid;
  v_previa    timestamptz;
begin
  -- Datos del paciente
  if length(v_nombre) < 3 or length(v_nombre) > 120 then
    return jsonb_build_object('ok', false, 'mensaje', 'Escribe tu nombre completo.');
  end if;
  if length(v_digitos) = 8 then
    v_telefono := '+504' || v_digitos;
  elsif length(v_digitos) = 11 and left(v_digitos, 3) = '504' then
    v_telefono := '+' || v_digitos;
  elsif btrim(coalesce(p_telefono, '')) like '+%' and length(v_digitos) between 8 and 15 then
    v_telefono := '+' || v_digitos;
  else
    return jsonb_build_object('ok', false, 'mensaje', 'Escribe tu número de WhatsApp de 8 dígitos.');
  end if;
  if v_correo is not null and v_correo !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'mensaje', 'Revisa tu correo electrónico o déjalo en blanco.');
  end if;

  -- Servicio reservable
  select * into v_trat from public.tratamientos t where t.slug = p_servicio and t.activo and t.reservable_web;
  if not found then
    return jsonb_build_object('ok', false, 'mensaje', 'Ese servicio no se puede reservar en línea. Escríbenos por WhatsApp.');
  end if;

  -- Límite contra abusos: una cita web por confirmar por teléfono, y un tope general por hora.
  select c.inicio into v_previa
  from public.citas c
  join public.pacientes pa on pa.id = c.paciente_id
  where pa.telefono = v_telefono and c.origen = 'web' and c.estado = 'pendiente' and c.inicio > now()
  limit 1;
  if v_previa is not null then
    return jsonb_build_object(
      'ok', false,
      'mensaje', 'Ya tienes una cita por confirmar el ' ||
                 to_char(v_previa at time zone 'America/Tegucigalpa', 'DD/MM/YYYY "a las" HH12:MI AM') ||
                 '. Si necesitas cambiarla, escríbenos por WhatsApp.');
  end if;
  if (select count(*) from public.citas c where c.origen = 'web' and c.created_at > now() - interval '1 hour') >= 30 then
    return jsonb_build_object('ok', false, 'mensaje', 'Estamos recibiendo muchas reservas. Intenta en unos minutos o escríbenos por WhatsApp.');
  end if;

  -- La hora tiene que seguir libre y dentro del horario
  select h.doctor_id into v_doctor
  from public.horarios_disponibles(v_fecha, p_servicio) h
  where h.inicio = p_inicio
  limit 1;
  if v_doctor is null or v_fecha > (now() at time zone 'America/Tegucigalpa')::date + 60 then
    return jsonb_build_object('ok', false, 'mensaje', 'Esa hora ya no está disponible. Elige otra, por favor.');
  end if;

  -- Paciente: se reutiliza si el teléfono ya existe (no se cambia su nombre)
  select pa.id into v_paciente from public.pacientes pa where pa.telefono = v_telefono;
  if v_paciente is null then
    insert into public.pacientes (nombre_completo, telefono, correo, origen)
    values (v_nombre, v_telefono, v_correo, 'web')
    returning id into v_paciente;
  end if;

  begin
    insert into public.citas (paciente_id, doctor_id, tratamiento_id, inicio, fin, estado, motivo, origen)
    values (v_paciente, v_doctor, v_trat.id, p_inicio, p_inicio + make_interval(mins => v_trat.duracion_minutos),
            'pendiente', v_motivo, 'web')
    returning id into v_cita;
  exception when exclusion_violation then
    return jsonb_build_object('ok', false, 'mensaje', 'Alguien acaba de reservar esa hora. Elige otra, por favor.');
  end;

  -- Queda registro de la solicitud (ya agendada) para el historial de recepción
  insert into public.solicitudes_cita
    (nombre, telefono, correo, motivo, tratamiento_id, fecha_preferida, horario_preferido, estado, paciente_id, cita_id, origen, datos_crudos)
  values
    (v_nombre, v_telefono, v_correo, v_motivo, v_trat.id, v_fecha,
     to_char(p_inicio at time zone 'America/Tegucigalpa', 'HH12:MI AM'), 'agendada', v_paciente, v_cita, 'web',
     jsonb_build_object('nombre', p_nombre, 'telefono', p_telefono, 'correo', p_correo, 'servicio', p_servicio, 'inicio', p_inicio));

  return jsonb_build_object(
    'ok', true,
    'cita_id', v_cita,
    'inicio', p_inicio,
    'servicio', v_trat.nombre,
    'mensaje', 'Tu cita quedó reservada. Te escribiremos por WhatsApp para confirmarla.');
end $$;

revoke execute on function public.web_servicios() from public;
revoke execute on function public.web_horarios(date, text) from public;
revoke execute on function public.web_reservar_cita(text, text, text, timestamptz, text, text) from public;
grant execute on function public.web_servicios() to anon, authenticated, service_role;
grant execute on function public.web_horarios(date, text) to anon, authenticated, service_role;
grant execute on function public.web_reservar_cita(text, text, text, timestamptz, text, text) to anon, authenticated, service_role;
