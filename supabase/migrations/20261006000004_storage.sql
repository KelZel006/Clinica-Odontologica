-- =====================================================================
-- Storage
--   expedientes (privado): radiografías, tomografías, fotos clínicas, consentimientos.
--                          Ruta: <paciente_id>/<nombre-archivo>
--   web (público):         imágenes de casos clínicos publicados y contenido del sitio.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('expedientes', 'expedientes', false, 52428800,   -- 50 MB (tomografías)
   array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/dicom']),
  ('web', 'web', true, 10485760,                  -- 10 MB
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "expedientes: leer" on storage.objects
  for select to authenticated
  using (bucket_id = 'expedientes' and (select public.tiene_permiso('expediente.ver')));

create policy "expedientes: subir" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'expedientes' and (select public.tiene_permiso('expediente.editar')));

create policy "expedientes: modificar" on storage.objects
  for update to authenticated
  using (bucket_id = 'expedientes' and (select public.tiene_permiso('expediente.editar')))
  with check (bucket_id = 'expedientes' and (select public.tiene_permiso('expediente.editar')));

create policy "expedientes: borrar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'expedientes' and (select public.tiene_permiso('expediente.editar')));

-- Bucket público: cualquiera puede ver las imágenes por URL; solo el personal clínico sube.
create policy "web: subir" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'web' and (select public.tiene_permiso('expediente.editar')));

create policy "web: modificar" on storage.objects
  for update to authenticated
  using (bucket_id = 'web' and (select public.tiene_permiso('expediente.editar')))
  with check (bucket_id = 'web' and (select public.tiene_permiso('expediente.editar')));

create policy "web: borrar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'web' and (select public.tiene_permiso('expediente.editar')));
