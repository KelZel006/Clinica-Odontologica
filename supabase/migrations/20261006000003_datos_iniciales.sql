-- =====================================================================
-- Datos iniciales de la clínica
-- Ajustar duraciones y precios reales desde el sistema (Catálogo de Tratamientos).
-- =====================================================================

with dr as (
  insert into public.doctores (nombre, especialidad)
  values ('Dr. Elías Renato Chirinos', 'Cirujano Dentista e Implantólogo')
  returning id
)
insert into public.horarios_atencion (doctor_id, dia_semana, hora_inicio, hora_fin)
select dr.id, d, '08:00', case when d = 6 then time '13:00' else time '18:00' end
from dr, generate_series(1, 6) d;   -- Lun–Vie 8:00–18:00, Sáb 8:00–13:00

insert into public.tratamientos (slug, nombre, categoria, descripcion, duracion_minutos, orden) values
  ('valoracion-implantes',    'Valoración de implantes', 'Implantología', 'Evaluación clínica y diagnóstico personalizado.', 45, 1),
  ('implante-unitario',       'Implante unitario',       'Implantología', 'Reemplazo de una pieza dental con una solución funcional, estable y de apariencia natural.', 90, 2),
  ('carga-inmediata',         'Carga inmediata',         'Implantología', 'Recupera tu sonrisa en menos tiempo mediante protocolos modernos y planificación precisa.', 120, 3),
  ('rehabilitacion-completa', 'Rehabilitación completa', 'Implantología', 'Solución integral (All-on-4 / All-on-6) para pérdida total o extensa de piezas dentales.', 180, 4),
  ('otro-tratamiento',        'Otro tratamiento',        'General',       'Consulta general.', 30, 5);
