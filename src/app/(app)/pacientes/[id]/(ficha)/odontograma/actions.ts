"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSesion, puede } from "@/lib/sesion";
import { esFechaISO } from "@/lib/fechas";
import { CONDICIONES, carasDePieza, type Cara, type Condicion, type EstadoHallazgo } from "@/components/odontograma/datos";

export type Resultado = { ok: true; mensaje?: string } | { ok: false; error: string };

const SIN_PERMISO: Resultado = { ok: false, error: "Tu rol no puede escribir en el expediente clínico." };

async function clienteClinico() {
  const sesion = await getSesion();
  return puede(sesion, "expediente.editar") ? createClient() : null;
}

const esPiezaFDI = (p: number) =>
  Number.isInteger(p) &&
  ((Math.floor(p / 10) >= 1 && Math.floor(p / 10) <= 4 && p % 10 >= 1 && p % 10 <= 8) ||
    (Math.floor(p / 10) >= 5 && Math.floor(p / 10) <= 8 && p % 10 >= 1 && p % 10 <= 5));

const uuid = /^[0-9a-f-]{36}$/i;

function errorLegible(error: { code?: string; message: string }) {
  if (error.code === "42501") return "Tu rol no tiene permiso para este cambio.";
  if (error.code === "23514") return "Algún dato está fuera de rango. Revisa los valores.";
  if (error.code === "22P02") return "La superficie elegida aún no existe en la base de datos. Aplica la última migración.";
  return "No se pudo guardar. Revisa tu conexión e intenta de nuevo.";
}

export type DatosImplante = {
  marca?: string;
  modelo?: string;
  diametroMm?: string;
  longitudMm?: string;
  fechaColocacion?: string;
  fechaCarga?: string;
  observaciones?: string;
};

function filaImplante(d: DatosImplante) {
  const num = (v?: string) => {
    if (!v?.trim()) return null;
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : NaN;
  };
  const diametro = num(d.diametroMm);
  const longitud = num(d.longitudMm);
  if (Number.isNaN(diametro) || Number.isNaN(longitud)) return { error: "Diámetro y longitud deben ser números en milímetros." };
  for (const f of [d.fechaColocacion, d.fechaCarga]) if (f && !esFechaISO(f)) return { error: "Revisa las fechas del implante." };
  if (d.fechaColocacion && d.fechaCarga && d.fechaCarga < d.fechaColocacion)
    return { error: "La fecha de carga no puede ser anterior a la colocación." };
  return {
    fila: {
      marca: d.marca?.trim() || null,
      modelo: d.modelo?.trim() || null,
      diametro_mm: diametro,
      longitud_mm: longitud,
      fecha_colocacion: d.fechaColocacion || null,
      fecha_carga: d.fechaCarga || null,
      observaciones: d.observaciones?.trim() || null,
    },
  };
}

export async function registrarHallazgo(entrada: {
  pacienteId: string;
  pieza: number;
  caras: Cara[];
  condicion: Condicion;
  estado: EstadoHallazgo;
  diagnostico: string;
  tratamientoId: string;
  observacion: string;
  implante?: DatosImplante;
}): Promise<Resultado> {
  const supabase = await clienteClinico();
  if (!supabase) return SIN_PERMISO;

  const { pacienteId, pieza, condicion, estado } = entrada;
  if (!uuid.test(pacienteId) || !esPiezaFDI(pieza)) return { ok: false, error: "Pieza no válida." };
  const meta = CONDICIONES[condicion];
  if (!meta || !["existente", "planificado", "realizado"].includes(estado)) return { ok: false, error: "Datos no válidos." };

  const validas = new Set<Cara>([...carasDePieza(pieza), "completa"]);
  const caras: Cara[] = meta.piezaCompleta ? ["completa"] : [...new Set(entrada.caras)].filter((c) => validas.has(c));
  if (caras.length === 0) return { ok: false, error: "Marca al menos una superficie (o «pieza completa»)." };

  let implante: ReturnType<typeof filaImplante>["fila"] | undefined;
  if (condicion === "implante" && entrada.implante) {
    const r = filaImplante(entrada.implante);
    if (r.error) return { ok: false, error: r.error };
    implante = r.fila;
  }

  const { data, error } = await supabase
    .from("odontograma")
    .insert(
      caras.map((cara) => ({
        paciente_id: pacienteId,
        pieza,
        cara,
        condicion,
        estado,
        diagnostico: entrada.diagnostico.trim() || null,
        tratamiento_id: uuid.test(entrada.tratamientoId) ? entrada.tratamientoId : null,
        observacion: entrada.observacion.trim() || null,
      })),
    )
    .select("id");
  if (error || !data?.length) return { ok: false, error: errorLegible(error ?? { message: "" }) };

  if (implante) {
    const { error: e } = await supabase.from("implantes").insert({ ...implante, paciente_id: pacienteId, pieza, hallazgo_id: data[0].id });
    if (e) return { ok: false, error: `El hallazgo se guardó, pero no la ficha del implante: ${errorLegible(e)}` };
  }

  revalidatePath(`/pacientes/${pacienteId}/odontograma`);
  return { ok: true, mensaje: `Pieza ${pieza}: ${meta.etiqueta.toLowerCase()} registrado.` };
}

export async function anularHallazgo(pacienteId: string, hallazgoId: string, motivo: string): Promise<Resultado> {
  const supabase = await clienteClinico();
  if (!supabase) return SIN_PERMISO;
  if (!motivo.trim()) return { ok: false, error: "Escribe por qué se anula (queda en el historial)." };
  const { error } = await supabase
    .from("odontograma")
    .update({ anulado: true, motivo_anulacion: motivo.trim() })
    .eq("id", hallazgoId)
    .eq("paciente_id", pacienteId);
  if (error) return { ok: false, error: errorLegible(error) };
  revalidatePath(`/pacientes/${pacienteId}/odontograma`);
  return { ok: true, mensaje: "Hallazgo anulado. Sigue visible en el historial." };
}

/** Un plan cumplido no se edita: se registra un hallazgo nuevo «realizado» y el anterior queda en el historial. */
export async function marcarRealizado(pacienteId: string, hallazgoId: string): Promise<Resultado> {
  const supabase = await clienteClinico();
  if (!supabase) return SIN_PERMISO;
  const { data: h } = await supabase
    .from("odontograma")
    .select("pieza, cara, condicion, diagnostico, tratamiento_id, observacion, estado, anulado")
    .eq("id", hallazgoId)
    .eq("paciente_id", pacienteId)
    .maybeSingle();
  if (!h || h.anulado || h.estado !== "planificado") return { ok: false, error: "Ese hallazgo ya no está planificado." };

  const { error } = await supabase.from("odontograma").insert({
    paciente_id: pacienteId,
    pieza: h.pieza,
    cara: h.cara,
    condicion: h.condicion,
    estado: "realizado",
    diagnostico: h.diagnostico,
    tratamiento_id: h.tratamiento_id,
    observacion: h.observacion,
  });
  if (error) return { ok: false, error: errorLegible(error) };
  revalidatePath(`/pacientes/${pacienteId}/odontograma`);
  return { ok: true, mensaje: `Pieza ${h.pieza}: marcado como realizado.` };
}

export async function guardarImplante(
  pacienteId: string,
  pieza: number,
  implanteId: string | null,
  datos: DatosImplante,
): Promise<Resultado> {
  const supabase = await clienteClinico();
  if (!supabase) return SIN_PERMISO;
  if (!uuid.test(pacienteId) || !esPiezaFDI(pieza)) return { ok: false, error: "Pieza no válida." };
  const r = filaImplante(datos);
  if (r.error || !r.fila) return { ok: false, error: r.error ?? "Datos no válidos." };

  const { error } = implanteId
    ? await supabase.from("implantes").update(r.fila).eq("id", implanteId).eq("paciente_id", pacienteId)
    : await supabase.from("implantes").insert({ ...r.fila, paciente_id: pacienteId, pieza });
  if (error) return { ok: false, error: errorLegible(error) };
  revalidatePath(`/pacientes/${pacienteId}/odontograma`);
  return { ok: true, mensaje: "Ficha del implante guardada." };
}
