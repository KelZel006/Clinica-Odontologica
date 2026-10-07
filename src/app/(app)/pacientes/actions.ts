"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesion, puede } from "@/lib/sesion";
import { esFechaISO } from "@/lib/fechas";
import { normalizarTelefono } from "@/lib/telefono";

export type EstadoPaciente = {
  error?: string;
  errores?: Partial<Record<"nombre_completo" | "telefono" | "fecha_nacimiento" | "identidad" | "telefono_emergencia", string>>;
  valores?: Record<string, string>;
};

const TEXTOS = [
  "nombre_completo",
  "correo",
  "sexo",
  "identidad",
  "ocupacion",
  "direccion",
  "contacto_emergencia",
  "alergias",
  "antecedentes_medicos",
  "medicamentos_actuales",
  "notas",
] as const;

export async function guardarPaciente(_: EstadoPaciente, formData: FormData): Promise<EstadoPaciente> {
  const sesion = await getSesion();
  if (!puede(sesion, "pacientes.editar")) return { error: "Tu rol no puede registrar ni editar pacientes." };

  const id = String(formData.get("id") ?? "");
  const valores = Object.fromEntries(
    [...TEXTOS, "telefono", "fecha_nacimiento", "telefono_emergencia"].map((k) => [k, String(formData.get(k) ?? "").trim()]),
  );
  const errores: EstadoPaciente["errores"] = {};

  if (!valores.nombre_completo) errores.nombre_completo = "Escribe el nombre completo.";
  const telefono = normalizarTelefono(valores.telefono);
  if (!telefono) errores.telefono = "Debe tener 8 dígitos (o incluir el código de país).";
  const telEmergencia = valores.telefono_emergencia ? normalizarTelefono(valores.telefono_emergencia) : null;
  if (valores.telefono_emergencia && !telEmergencia) errores.telefono_emergencia = "Revisa el número: 8 dígitos.";
  if (valores.fecha_nacimiento && (!esFechaISO(valores.fecha_nacimiento) || valores.fecha_nacimiento > new Date().toISOString().slice(0, 10)))
    errores.fecha_nacimiento = "La fecha no es válida.";
  if (valores.identidad && !/^\d{4}-?\d{4}-?\d{5}$/.test(valores.identidad))
    errores.identidad = "El DNI tiene 13 dígitos (0801-1990-12345).";

  if (Object.keys(errores).length) return { errores, valores };

  const vacioANull = (v: string) => v || null;
  const fila = {
    nombre_completo: valores.nombre_completo,
    telefono: telefono!,
    correo: vacioANull(valores.correo),
    fecha_nacimiento: vacioANull(valores.fecha_nacimiento),
    sexo: (["F", "M", "otro"].includes(valores.sexo) ? valores.sexo : null) as "F" | "M" | "otro" | null,
    identidad: valores.identidad ? valores.identidad.replace(/\D/g, "").replace(/^(\d{4})(\d{4})(\d{5})$/, "$1-$2-$3") : null,
    ocupacion: vacioANull(valores.ocupacion),
    direccion: vacioANull(valores.direccion),
    contacto_emergencia: vacioANull(valores.contacto_emergencia),
    telefono_emergencia: telEmergencia,
    alergias: vacioANull(valores.alergias),
    antecedentes_medicos: vacioANull(valores.antecedentes_medicos),
    medicamentos_actuales: vacioANull(valores.medicamentos_actuales),
    notas: vacioANull(valores.notas),
  };

  const supabase = await createClient();
  const { data, error } = id
    ? await supabase.from("pacientes").update(fila).eq("id", id).select("id").single()
    : await supabase.from("pacientes").insert({ ...fila, origen: "recepcion" }).select("id").single();

  if (error || !data) {
    if (error?.code === "23505") {
      const campo = error.message.includes("identidad") ? "identidad" : "telefono";
      return {
        errores: { [campo]: campo === "telefono" ? "Ya hay un paciente con este teléfono." : "Ya hay un paciente con este DNI." },
        valores,
      };
    }
    return { error: "No se pudo guardar. Revisa tu conexión e intenta de nuevo.", valores };
  }

  revalidatePath("/pacientes");
  redirect(`/pacientes/${data.id}`);
}
