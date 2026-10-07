"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSesion, puede, type Permiso } from "@/lib/sesion";
import { esFechaISO } from "@/lib/fechas";
import { lempiras } from "@/lib/lempiras";
import { METODOS, uuidValido, type EstadoPlan, type FrecuenciaPago, type MetodoPago } from "@/lib/finanzas";

export type Resultado = { ok: true; mensaje?: string } | { ok: false; error: string };
export type ResultadoAbono = { ok: true; mensaje: string; datos: { abonoId: string; recibo: number } } | { ok: false; error: string };

async function cliente(permiso: Permiso) {
  const sesion = await getSesion();
  return puede(sesion, permiso) ? createClient() : null;
}

const sinPermiso = (quien: string) => ({ ok: false as const, error: `Solo ${quien} puede hacer esto.` });

function errorLegible(error: { code?: string; message: string }) {
  if (error.code === "42501") return "Tu rol no tiene permiso para este cambio.";
  if (error.code === "23505") return "Este plan ya tiene un plan de pago activo.";
  if (error.code === "23514") return "Algún monto está fuera de rango. Revísalo.";
  return "No se pudo guardar. Revisa tu conexión e intenta de nuevo.";
}

const esPiezaFDI = (p: number) =>
  Number.isInteger(p) &&
  ((Math.floor(p / 10) >= 1 && Math.floor(p / 10) <= 4 && p % 10 >= 1 && p % 10 <= 8) ||
    (Math.floor(p / 10) >= 5 && Math.floor(p / 10) <= 8 && p % 10 >= 1 && p % 10 <= 5));

const revalidar = (pacienteId: string) => {
  revalidatePath(`/pacientes/${pacienteId}/finanzas`);
  revalidatePath("/finanzas");
};

// ---------------------------------------------------------------------------
// Planes de tratamiento (solo el doctor o administración: expediente.editar)
// ---------------------------------------------------------------------------

export type PartidaPlan = {
  tratamientoId: string | null;
  descripcion: string;
  pieza: string;
  cantidad: string;
  precio: string;
};

export async function guardarPlan(entrada: {
  pacienteId: string;
  planId: string | null;
  titulo: string;
  descuento: string;
  notas: string;
  partidas: PartidaPlan[];
}): Promise<Resultado> {
  const supabase = await cliente("expediente.editar");
  if (!supabase) return sinPermiso("el doctor");
  if (!uuidValido(entrada.pacienteId)) return { ok: false, error: "Paciente no válido." };
  if (!entrada.titulo.trim()) return { ok: false, error: "Ponle un título al plan (por ejemplo, «Rehabilitación superior»)." };

  const partidas = [];
  for (const [i, p] of entrada.partidas.entries()) {
    const n = i + 1;
    if (!p.descripcion.trim()) return { ok: false, error: `La partida ${n} no tiene descripción.` };
    const cantidad = Number(p.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 1) return { ok: false, error: `La cantidad de la partida ${n} debe ser un entero mayor que cero.` };
    const precio = Number(p.precio.replace(/,/g, ""));
    if (!Number.isFinite(precio) || precio < 0) return { ok: false, error: `El precio de la partida ${n} no es válido.` };
    const pieza = p.pieza.trim() ? Number(p.pieza) : null;
    if (pieza !== null && !esPiezaFDI(pieza)) return { ok: false, error: `La pieza de la partida ${n} no es un número FDI válido.` };
    partidas.push({
      tratamiento_id: uuidValido(p.tratamientoId) ? p.tratamientoId : null,
      descripcion: p.descripcion.trim(),
      pieza,
      cantidad,
      precio_unitario: Math.round(precio * 100) / 100,
      orden: i,
    });
  }
  if (partidas.length === 0) return { ok: false, error: "Agrega al menos una partida al plan." };

  const subtotal = partidas.reduce((s, p) => s + p.cantidad * p.precio_unitario, 0);
  const descuento = entrada.descuento.trim() ? Number(entrada.descuento.replace(/,/g, "")) : 0;
  if (!Number.isFinite(descuento) || descuento < 0 || descuento > subtotal)
    return { ok: false, error: "El descuento debe estar entre 0 y el subtotal del plan." };

  let planId = entrada.planId;
  if (planId) {
    const { data: actual } = await supabase.from("planes_tratamiento").select("estado").eq("id", planId).maybeSingle();
    if (actual?.estado !== "propuesto") return { ok: false, error: "Solo se puede modificar un plan mientras está «propuesto»." };
    const { error } = await supabase
      .from("planes_tratamiento")
      .update({ titulo: entrada.titulo.trim(), descuento, notas: entrada.notas.trim() || null })
      .eq("id", planId);
    if (error) return { ok: false, error: errorLegible(error) };
    const { error: e2 } = await supabase.from("plan_items").delete().eq("plan_id", planId);
    if (e2) return { ok: false, error: errorLegible(e2) };
  } else {
    const sesion = await getSesion();
    const { data: doctor } = await supabase.from("doctores").select("id").eq("perfil_id", sesion.userId).maybeSingle();
    const { data, error } = await supabase
      .from("planes_tratamiento")
      .insert({
        paciente_id: entrada.pacienteId,
        doctor_id: doctor?.id ?? null,
        titulo: entrada.titulo.trim(),
        descuento,
        notas: entrada.notas.trim() || null,
      })
      .select("id")
      .single();
    if (error || !data) return { ok: false, error: errorLegible(error ?? { message: "" }) };
    planId = data.id;
  }

  const { error } = await supabase.from("plan_items").insert(partidas.map((p) => ({ ...p, plan_id: planId! })));
  if (error) return { ok: false, error: errorLegible(error) };

  revalidar(entrada.pacienteId);
  return { ok: true, mensaje: `Plan guardado: ${lempiras(subtotal - descuento)}.` };
}

const TRANSICIONES: Record<EstadoPlan, EstadoPlan[]> = {
  propuesto: ["aceptado", "rechazado"],
  aceptado: ["en_curso", "propuesto", "rechazado"],
  en_curso: ["finalizado", "aceptado"],
  finalizado: ["en_curso"],
  rechazado: ["propuesto"],
};

export async function cambiarEstadoPlan(pacienteId: string, planId: string, de: EstadoPlan, a: EstadoPlan): Promise<Resultado> {
  const supabase = await cliente("expediente.editar");
  if (!supabase) return sinPermiso("el doctor");
  if (!TRANSICIONES[de]?.includes(a)) return { ok: false, error: "Ese cambio de estado no está permitido." };
  const { error } = await supabase
    .from("planes_tratamiento")
    .update({ estado: a, ...(a === "aceptado" && de === "propuesto" ? { aceptado_at: new Date().toISOString() } : {}) })
    .eq("id", planId)
    .eq("estado", de);
  if (error) return { ok: false, error: errorLegible(error) };
  revalidar(pacienteId);
  return { ok: true };
}

export async function marcarPartida(pacienteId: string, itemId: string, completado: boolean): Promise<Resultado> {
  const supabase = await cliente("expediente.editar");
  if (!supabase) return sinPermiso("el doctor");
  const { error } = await supabase.from("plan_items").update({ completado }).eq("id", itemId);
  if (error) return { ok: false, error: errorLegible(error) };
  revalidar(pacienteId);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Plan de pago (recepción / administración: finanzas.editar)
// ---------------------------------------------------------------------------

export async function crearPlanPago(entrada: {
  pacienteId: string;
  planId: string;
  prima: string;
  numeroCuotas: string;
  frecuencia: FrecuenciaPago;
  fechaInicio: string;
}): Promise<Resultado> {
  const supabase = await cliente("finanzas.editar");
  if (!supabase) return sinPermiso("recepción o administración");

  const { data: saldo } = await supabase.from("v_saldo_planes").select("saldo, estado").eq("plan_id", entrada.planId).maybeSingle();
  const porPagar = Number(saldo?.saldo ?? 0);
  if (!saldo || saldo.estado === "rechazado") return { ok: false, error: "Ese plan de tratamiento no admite plan de pago." };
  if (porPagar <= 0) return { ok: false, error: "Este plan no tiene saldo POR PAGAR." };

  const prima = entrada.prima.trim() ? Number(entrada.prima.replace(/,/g, "")) : 0;
  if (!Number.isFinite(prima) || prima < 0 || prima >= porPagar)
    return { ok: false, error: `El enganche debe ser menor que lo POR PAGAR (${lempiras(porPagar)}).` };
  const cuotas = Number(entrada.numeroCuotas);
  if (!Number.isInteger(cuotas) || cuotas < 1 || cuotas > 60) return { ok: false, error: "El número de cuotas debe estar entre 1 y 60." };
  if (!["semanal", "quincenal", "mensual"].includes(entrada.frecuencia)) return { ok: false, error: "Frecuencia no válida." };
  if (!esFechaISO(entrada.fechaInicio)) return { ok: false, error: "Elige la fecha de la primera cuota." };

  const { data: plan, error } = await supabase
    .from("planes_pago")
    .insert({
      plan_tratamiento_id: entrada.planId,
      monto_total: porPagar,
      prima,
      numero_cuotas: cuotas,
      frecuencia: entrada.frecuencia,
      fecha_inicio: entrada.fechaInicio,
    })
    .select("id")
    .single();
  if (error || !plan) return { ok: false, error: errorLegible(error ?? { message: "" }) };

  const { error: e2 } = await supabase.rpc("generar_cuotas", { p_plan_pago_id: plan.id });
  if (e2) {
    await supabase.from("planes_pago").update({ activo: false }).eq("id", plan.id);
    return { ok: false, error: "Se creó el plan de pago, pero no se pudieron generar las cuotas. Intenta de nuevo." };
  }
  revalidar(entrada.pacienteId);
  return { ok: true, mensaje: `Plan de pago creado: ${cuotas} ${cuotas === 1 ? "cuota" : "cuotas"}.` };
}

export async function cancelarPlanPago(pacienteId: string, planPagoId: string): Promise<Resultado> {
  const supabase = await cliente("finanzas.editar");
  if (!supabase) return sinPermiso("recepción o administración");
  // Las cuotas que aún no tienen abonos quedan anuladas; las abonadas se conservan.
  const { data: cuotas } = await supabase.from("v_cuotas_estado").select("cuota_id, pagado").eq("plan_pago_id", planPagoId);
  const sinAbono = (cuotas ?? []).filter((c) => Number(c.pagado ?? 0) === 0).map((c) => c.cuota_id!);
  if (sinAbono.length) await supabase.from("cuotas").update({ estado: "anulada" }).in("id", sinAbono);
  const { error } = await supabase.from("planes_pago").update({ activo: false }).eq("id", planPagoId);
  if (error) return { ok: false, error: errorLegible(error) };
  revalidar(pacienteId);
  return { ok: true, mensaje: "Plan de pago cancelado. Los abonos registrados se conservan." };
}

// ---------------------------------------------------------------------------
// Abonos (recepción / administración: finanzas.editar)
// ---------------------------------------------------------------------------

export async function registrarAbono(entrada: {
  pacienteId: string;
  planId: string | null;
  cuotaId: string | null;
  monto: number;
  metodo: MetodoPago;
  referencia: string;
  concepto: string;
  notas: string;
}): Promise<ResultadoAbono> {
  const supabase = await cliente("finanzas.editar");
  if (!supabase) return sinPermiso("recepción o administración");
  if (!uuidValido(entrada.pacienteId)) return { ok: false, error: "Paciente no válido." };
  if (!Number.isFinite(entrada.monto) || entrada.monto <= 0) return { ok: false, error: "Escribe un monto mayor que cero." };
  const metodo = METODOS.find((m) => m.valor === entrada.metodo);
  if (!metodo) return { ok: false, error: "Elige un método de pago." };
  if (metodo.pideReferencia && !entrada.referencia.trim())
    return { ok: false, error: `Escribe el número de referencia de la ${metodo.etiqueta.toLowerCase()}.` };

  if (entrada.planId) {
    const { data: saldo } = await supabase.from("v_saldo_planes").select("saldo, paciente_id").eq("plan_id", entrada.planId).maybeSingle();
    if (!saldo || saldo.paciente_id !== entrada.pacienteId) return { ok: false, error: "Ese plan no pertenece al paciente." };
    const porPagar = Number(saldo.saldo ?? 0);
    if (entrada.monto > porPagar + 0.001)
      return { ok: false, error: `El abono supera lo POR PAGAR del plan (${lempiras(porPagar)}).` };
  }

  const { data, error } = await supabase
    .from("abonos")
    .insert({
      paciente_id: entrada.pacienteId,
      plan_tratamiento_id: entrada.planId,
      cuota_id: uuidValido(entrada.cuotaId) ? entrada.cuotaId : null,
      monto: Math.round(entrada.monto * 100) / 100,
      metodo: entrada.metodo,
      referencia: entrada.referencia.trim() || null,
      concepto: entrada.concepto.trim() || "Abono",
      notas: entrada.notas.trim() || null,
    })
    .select("id, recibo_numero")
    .single();
  if (error || !data) return { ok: false, error: errorLegible(error ?? { message: "" }) };

  revalidar(entrada.pacienteId);
  return { ok: true, mensaje: `Abono de ${lempiras(entrada.monto)} registrado.`, datos: { abonoId: data.id, recibo: data.recibo_numero } };
}

export async function anularAbono(pacienteId: string, abonoId: string, motivo: string): Promise<Resultado> {
  const supabase = await cliente("finanzas.editar");
  if (!supabase) return sinPermiso("recepción o administración");
  if (!motivo.trim()) return { ok: false, error: "Escribe por qué se anula el abono (queda en el historial)." };
  const { error } = await supabase
    .from("abonos")
    .update({ anulado: true, motivo_anulacion: motivo.trim() })
    .eq("id", abonoId)
    .eq("paciente_id", pacienteId);
  if (error) return { ok: false, error: errorLegible(error) };
  revalidar(pacienteId);
  return { ok: true, mensaje: "Abono anulado. Sigue visible en el historial." };
}
