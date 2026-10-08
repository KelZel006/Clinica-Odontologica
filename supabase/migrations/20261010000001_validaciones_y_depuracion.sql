-- =====================================================================
-- 1) Validaciones en la base de datos (la última barrera, sin importar quién escriba:
--    la app, la landing, n8n o una edición directa).
--      · DNI: exactamente 13 dígitos, guardado sin guiones (0801199012345).
--      · Teléfonos: número hondureño de 8 dígitos, guardado como +504XXXXXXXX.
-- 2) Depurar registros de quien reservó y nunca llegó: eliminar_paciente_sin_atencion().
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. DNI de 13 dígitos (los existentes se guardaban con guiones)
-- ---------------------------------------------------------------------
update public.pacientes
set identidad = regexp_replace(identidad, '\D', '', 'g')
where identidad is not null and identidad ~ '\D';

update public.pacientes set identidad = null where identidad is not null and btrim(identidad) = '';

alter table public.pacientes
  add constraint pacientes_identidad_13_digitos check (identidad ~ '^[0-9]{13}$');

-- ---------------------------------------------------------------------
-- 2. Teléfonos de 8 dígitos (+504 y 8 dígitos)
-- ---------------------------------------------------------------------
alter table public.pacientes
  add constraint pacientes_telefono_8_digitos check (telefono ~ '^[+]504[0-9]{8}$'),
  add constraint pacientes_telefono_emergencia_8_digitos check (telefono_emergencia ~ '^[+]504[0-9]{8}$');

alter table public.doctores
  add constraint doctores_telefono_8_digitos check (telefono ~ '^[+]504[0-9]{8}$');

alter table public.perfiles
  add constraint perfiles_telefono_8_digitos check (telefono ~ '^[+]504[0-9]{8}$');

-- La reserva web ya no acepta números extranjeros: solo 8 dígitos (con o sin 504 delante).
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
  if length(v_digitos) = 11 and left(v_digitos, 3) = '504' then
    v_digitos := right(v_digitos, 8);
  end if;
  if length(v_digitos) <> 8 then
    return jsonb_build_object('ok', false, 'mensaje', 'Escribe tu número de WhatsApp de 8 dígitos.');
  end if;
  v_telefono := '+504' || v_digitos;
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

-- ---------------------------------------------------------------------
-- 3. Eliminar a quien nunca fue paciente
--
-- Caso típico: alguien reservó desde la web (o recepción lo registró), la cita quedó
-- «no asistió» o «cancelada» y nunca volvió. Su ficha solo ocupa espacio en la lista.
--
-- Solo se puede eliminar si NUNCA hubo atención:
--   · ninguna cita completada, ni citas pendientes/confirmadas por venir;
--   · nada en el expediente (notas, odontograma, archivos, planes de tratamiento);
--   · ningún abono.
-- Se borran sus citas y la ficha. La solicitud web se conserva como «descartada».
-- La auditoría guarda una copia de todo lo borrado, con quién y cuándo.
-- Requiere el permiso pacientes.eliminar (rol administrador).
-- ---------------------------------------------------------------------

/** Devuelve null si se puede eliminar; si no, la razón en lenguaje claro. */
create or replace function public.motivo_no_eliminable(p_paciente uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when not public.tiene_permiso('pacientes.eliminar')
      then 'Tu rol no puede eliminar pacientes.'
    when not exists (select 1 from public.pacientes where id = p_paciente)
      then 'El paciente no existe.'
    when exists (select 1 from public.citas where paciente_id = p_paciente and estado = 'completada')
      then 'Ya fue atendido: tiene citas completadas.'
    when exists (select 1 from public.citas where paciente_id = p_paciente and estado in ('pendiente', 'confirmada') and fin > now())
      then 'Tiene una cita por venir. Cancélala o márcala como «no asistió» primero.'
    when exists (select 1 from public.notas_clinicas where paciente_id = p_paciente)
      or exists (select 1 from public.odontograma where paciente_id = p_paciente)
      or exists (select 1 from public.archivos_paciente where paciente_id = p_paciente)
      or exists (select 1 from public.planes_tratamiento where paciente_id = p_paciente)
      then 'Tiene información en su expediente clínico.'
    when exists (select 1 from public.abonos where paciente_id = p_paciente)
      then 'Tiene pagos registrados.'
    else null
  end;
$$;

create or replace function public.eliminar_paciente_sin_atencion(p_paciente uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nombre text;
  v_motivo text;
  v_citas  int;
begin
  if not public.tiene_permiso('pacientes.eliminar') then
    return jsonb_build_object('ok', false, 'mensaje', 'Tu rol no puede eliminar pacientes.');
  end if;

  -- Bloquea la ficha para que nadie le agregue algo mientras se revisa
  select nombre_completo into v_nombre from public.pacientes where id = p_paciente for update;

  v_motivo := public.motivo_no_eliminable(p_paciente);
  if v_motivo is not null then
    return jsonb_build_object('ok', false, 'mensaje', 'No se puede eliminar: ' || v_motivo);
  end if;

  update public.solicitudes_cita
  set estado = 'descartada'
  where paciente_id = p_paciente and estado <> 'descartada';

  delete from public.citas where paciente_id = p_paciente;
  get diagnostics v_citas = row_count;

  delete from public.pacientes where id = p_paciente;

  return jsonb_build_object(
    'ok', true,
    'mensaje', v_nombre || ' fue eliminado' ||
               case when v_citas > 0 then ' junto con ' || v_citas || case when v_citas = 1 then ' cita' else ' citas' end else '' end ||
               '. Queda copia en la auditoría.');
end $$;

-- Sin borrado directo de pacientes: el DELETE por la API arrastraba en cascada notas,
-- odontograma y archivos. La única vía es eliminar_paciente_sin_atencion().
drop policy if exists "borrar (pacientes.eliminar)" on public.pacientes;

revoke execute on function public.motivo_no_eliminable(uuid) from public, anon;
revoke execute on function public.eliminar_paciente_sin_atencion(uuid) from public, anon;
grant execute on function public.motivo_no_eliminable(uuid) to authenticated, service_role;
grant execute on function public.eliminar_paciente_sin_atencion(uuid) to authenticated, service_role;
