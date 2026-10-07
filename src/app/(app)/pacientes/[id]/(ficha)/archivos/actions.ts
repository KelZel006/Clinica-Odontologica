"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSesion, puede } from "@/lib/sesion";

const TIPOS = ["radiografia", "tomografia", "foto", "consentimiento", "otro"] as const;
export type TipoArchivo = (typeof TIPOS)[number];

/** Registra en el expediente un archivo ya subido al bucket privado «expedientes». */
export async function registrarArchivo(entrada: {
  pacienteId: string;
  ruta: string;
  tipo: TipoArchivo;
  descripcion: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const sesion = await getSesion();
  if (!puede(sesion, "expediente.editar")) return { ok: false, error: "Tu rol no puede subir archivos clínicos." };
  if (!entrada.ruta.startsWith(`${entrada.pacienteId}/`) || !TIPOS.includes(entrada.tipo)) {
    return { ok: false, error: "Datos del archivo no válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("archivos_paciente").insert({
    paciente_id: entrada.pacienteId,
    storage_path: entrada.ruta,
    tipo: entrada.tipo,
    descripcion: entrada.descripcion.trim() || null,
  });
  if (error) {
    // El archivo quedó en Storage sin registro: se borra para no dejar huérfanos.
    await supabase.storage.from("expedientes").remove([entrada.ruta]);
    return { ok: false, error: "No se pudo registrar el archivo. Intenta de nuevo." };
  }
  revalidatePath(`/pacientes/${entrada.pacienteId}/archivos`);
  return { ok: true };
}
