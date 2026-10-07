"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSesion, puede } from "@/lib/sesion";
import { esFechaISO, hora } from "@/lib/fechas";
import { normalizarTelefono } from "@/lib/telefono";
import type { EstadoCita, Resultado } from "./tipos";

const SIN_PERMISO = { ok: false, error: "Tu rol no puede modificar la agenda." } as const;

/** Devuelve el cliente solo si el rol puede editar citas. RLS lo vuelve a comprobar. */
async function clienteEditor() {
  const sesion = await getSesion();
  return puede(sesion, "citas.editar") ? createClient() : null;
}

function errorLegible(error: { code?: string; message: string }) {
  if (error.code === "23P01") return "Ese horario ya está ocupado por otra cita del doctor. Elige otra hora.";
  if (error.code === "42501") return "Tu rol no tiene permiso para hacer este cambio.";
  if (error.code === "23505") return "Ya existe un registro con esos datos.";
  return "No se pudo guardar. Revisa tu conexión e intenta de nuevo.";
}

export type HorarioLibre = { doctorId: string; doctor: string; inicio: string; fin: string; etiqueta: string };

/** Huecos libres del día; null si no se pudieron consultar. */
export async function obtenerHorarios(fecha: string, tratamientoSlug: string | null): Promise<HorarioLibre[] | null> {
  if (!esFechaISO(fecha)) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("horarios_disponibles", {
    p_fecha: fecha,
    ...(tratamientoSlug ? { p_tratamiento_slug: tratamientoSlug } : {}),
  });
  if (error || !data) return null;
  return data.map((h) => ({
    doctorId: h.doctor_id,
    doctor: h.doctor,
    inicio: h.inicio,
    fin: h.fin,
    etiqueta: hora(h.inicio),
  }));
}

export type PacienteEncontrado = { id: string; nombre: string; telefono: string; expediente: number };

export async function buscarPacientes(consulta: string): Promise<PacienteEncontrado[]> {
  // Solo letras, números, espacios y signos de nombre: nada que rompa el filtro de PostgREST.
  const limpio = consulta.replace(/[^\p{L}\p{N}\s.'-]/gu, " ").trim();
  if (limpio.length < 2) return [];
  const digitos = limpio.replace(/\D/g, "");

  const supabase = await createClient();
  const filtros = [`nombre_completo.ilike.%${limpio}%`];
  if (digitos.length >= 3) filtros.push(`telefono.ilike.%${digitos}%`);
  if (/^\d{1,7}$/.test(limpio)) filtros.push(`numero_expediente.eq.${limpio}`);

  const { data } = await supabase
    .from("pacientes")
    .select("id, nombre_completo, telefono, numero_expediente")
    .eq("activo", true)
    .or(filtros.join(","))
    .order("nombre_completo")
    .limit(8);

  return (data ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre_completo,
    telefono: p.telefono,
    expediente: p.numero_expediente,
  }));
}

export async function crearCita(formData: FormData): Promise<Resultado> {
  const supabase = await clienteEditor();
  if (!supabase) return SIN_PERMISO;

  const pacienteId = String(formData.get("paciente_id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const telefonoCrudo = String(formData.get("telefono") ?? "");
  const tratamientoId = String(formData.get("tratamiento_id") ?? "") || null;
  const doctorId = String(formData.get("doctor_id") ?? "");
  const inicio = String(formData.get("inicio") ?? "");
  const fin = String(formData.get("fin") ?? "");
  const motivo = String(formData.get("motivo") ?? "").trim() || null;
  const solicitudId = String(formData.get("solicitud_id") ?? "") || null;

  if (!doctorId || !inicio || !fin) return { ok: false, error: "Elige una hora disponible." };

  let idPaciente = pacienteId;
  let avisoPaciente: string | undefined;

  if (!idPaciente) {
    if (!nombre) return { ok: false, error: "Escribe el nombre del paciente." };
    const telefono = normalizarTelefono(telefonoCrudo);
    if (!telefono) return { ok: false, error: "El teléfono debe tener 8 dígitos (o incluir el código de país)." };

    // El teléfono es único: si ya existe, la cita se asigna a ese paciente en lugar de duplicarlo.
    const { data: existente } = await supabase
      .from("pacientes")
      .select("id, nombre_completo")
      .eq("telefono", telefono)
      .maybeSingle();

    if (existente) {
      idPaciente = existente.id;
      avisoPaciente = `El teléfono ya era de ${existente.nombre_completo}; la cita quedó a su nombre.`;
    } else {
      const { data: nuevo, error } = await supabase
        .from("pacientes")
        .insert({ nombre_completo: nombre, telefono, origen: solicitudId ? "web" : "recepcion" })
        .select("id")
        .single();
      if (error || !nuevo) return { ok: false, error: errorLegible(error ?? { message: "" }) };
      idPaciente = nuevo.id;
    }
  }

  const { data: cita, error } = await supabase
    .from("citas")
    .insert({
      paciente_id: idPaciente,
      doctor_id: doctorId,
      tratamiento_id: tratamientoId,
      inicio,
      fin,
      motivo,
      origen: solicitudId ? "solicitud_web" : "sistema",
    })
    .select("id")
    .single();

  if (error || !cita) return { ok: false, error: errorLegible(error ?? { message: "" }) };

  if (solicitudId) {
    await supabase
      .from("solicitudes_cita")
      .update({ estado: "agendada", paciente_id: idPaciente, cita_id: cita.id })
      .eq("id", solicitudId);
  }

  revalidatePath("/agenda", "layout");
  return { ok: true, mensaje: avisoPaciente ?? `Cita agendada para las ${hora(inicio)}.` };
}

const TRANSICIONES: Partial<Record<EstadoCita, EstadoCita[]>> = {
  pendiente: ["confirmada", "completada", "no_asistio"],
  confirmada: ["completada", "no_asistio", "pendiente"],
  completada: ["confirmada"],
  no_asistio: ["pendiente"],
};

export async function cambiarEstadoCita(citaId: string, de: EstadoCita, a: EstadoCita): Promise<Resultado> {
  const supabase = await clienteEditor();
  if (!supabase) return SIN_PERMISO;
  if (!TRANSICIONES[de]?.includes(a)) return { ok: false, error: "Ese cambio de estado no está permitido." };

  const { error } = await supabase
    .from("citas")
    .update({
      estado: a,
      ...(a === "confirmada" && de === "pendiente" ? { confirmada_at: new Date().toISOString() } : {}),
      ...(a === "pendiente" ? { confirmada_at: null } : {}),
    })
    .eq("id", citaId)
    .eq("estado", de);

  if (error) return { ok: false, error: errorLegible(error) };
  revalidatePath("/agenda");
  return { ok: true };
}

export async function cancelarCita(citaId: string, motivo: string): Promise<Resultado> {
  const supabase = await clienteEditor();
  if (!supabase) return SIN_PERMISO;
  const { error } = await supabase
    .from("citas")
    .update({ estado: "cancelada", cancelada_at: new Date().toISOString(), motivo_cancelacion: motivo.trim() || null })
    .eq("id", citaId)
    .in("estado", ["pendiente", "confirmada"]);

  if (error) return { ok: false, error: errorLegible(error) };
  revalidatePath("/agenda");
  return { ok: true, mensaje: "Cita cancelada. El horario quedó libre." };
}

export async function marcarSolicitud(
  solicitudId: string,
  estado: "contactada" | "descartada" | "nueva",
): Promise<Resultado> {
  const supabase = await clienteEditor();
  if (!supabase) return SIN_PERMISO;
  const { error } = await supabase.from("solicitudes_cita").update({ estado }).eq("id", solicitudId);
  if (error) return { ok: false, error: errorLegible(error) };
  revalidatePath("/agenda", "layout");
  return { ok: true };
}
