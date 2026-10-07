"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesion, puede } from "@/lib/sesion";

export type EstadoNota = { error?: string; errores?: { piezas?: string; contenido?: string }; valores?: Record<string, string> };

const esPiezaFDI = (p: number) =>
  Number.isInteger(p) &&
  ((Math.floor(p / 10) >= 1 && Math.floor(p / 10) <= 4 && p % 10 >= 1 && p % 10 <= 8) ||
    (Math.floor(p / 10) >= 5 && Math.floor(p / 10) <= 8 && p % 10 >= 1 && p % 10 <= 5));

export async function crearNota(_: EstadoNota, formData: FormData): Promise<EstadoNota> {
  const sesion = await getSesion();
  if (!puede(sesion, "expediente.editar")) return { error: "Tu rol no puede escribir notas clínicas." };

  const campos = ["paciente_id", "cita_id", "motivo_consulta", "diagnostico", "procedimiento_realizado", "piezas", "indicaciones"] as const;
  const v = Object.fromEntries(campos.map((k) => [k, String(formData.get(k) ?? "").trim()])) as Record<(typeof campos)[number], string>;

  if (!/^[0-9a-f-]{36}$/i.test(v.paciente_id)) return { error: "Paciente no válido." };

  const piezas = v.piezas
    ? v.piezas
        .split(/[\s,;]+/)
        .filter(Boolean)
        .map(Number)
    : [];
  const errores: EstadoNota["errores"] = {};
  if (piezas.some((p) => !esPiezaFDI(p))) errores.piezas = "Usa números FDI separados por coma, por ejemplo: 36, 46.";
  if (!v.motivo_consulta && !v.diagnostico && !v.procedimiento_realizado && !v.indicaciones)
    errores.contenido = "Escribe al menos el motivo, el diagnóstico, el procedimiento o las indicaciones.";
  if (Object.keys(errores).length) return { errores, valores: v };

  const supabase = await createClient();
  const { data: doctor } = await supabase.from("doctores").select("id").eq("perfil_id", sesion.userId).maybeSingle();

  const { error } = await supabase.from("notas_clinicas").insert({
    paciente_id: v.paciente_id,
    cita_id: /^[0-9a-f-]{36}$/i.test(v.cita_id) ? v.cita_id : null,
    doctor_id: doctor?.id ?? null,
    motivo_consulta: v.motivo_consulta || null,
    diagnostico: v.diagnostico || null,
    procedimiento_realizado: v.procedimiento_realizado || null,
    piezas_dentales: piezas.length ? [...new Set(piezas)] : null,
    indicaciones: v.indicaciones || null,
  });
  if (error) {
    return {
      error: error.code === "42501" ? "Tu rol no tiene permiso para esto." : "No se pudo guardar la nota. Revisa tu conexión e intenta de nuevo.",
      valores: v,
    };
  }

  revalidatePath(`/pacientes/${v.paciente_id}/notas`);
  redirect(`/pacientes/${v.paciente_id}/notas`);
}
