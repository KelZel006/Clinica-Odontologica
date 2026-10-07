import type { Database } from "@/types/database.types";

type Enums = Database["public"]["Enums"];
export type MetodoPago = Enums["metodo_pago"];
export type EstadoPlan = Enums["estado_plan"];
export type FrecuenciaPago = Enums["frecuencia_pago"];

/** Métodos que acepta la clínica, en el orden en que se ofrecen. «otro» queda solo para registros antiguos. */
export const METODOS: { valor: MetodoPago; etiqueta: string; pideReferencia: boolean }[] = [
  { valor: "efectivo", etiqueta: "Efectivo", pideReferencia: false },
  { valor: "transferencia", etiqueta: "Transferencia bancaria", pideReferencia: true },
  { valor: "tarjeta", etiqueta: "Tarjeta", pideReferencia: true },
  { valor: "deposito", etiqueta: "Depósito bancario", pideReferencia: true },
];

export const ETIQUETA_METODO: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  deposito: "Depósito bancario",
  otro: "Otro",
};

export const ETIQUETA_PLAN: Record<EstadoPlan, string> = {
  propuesto: "Propuesto",
  aceptado: "Aceptado",
  en_curso: "En curso",
  finalizado: "Finalizado",
  rechazado: "Rechazado",
};

export const ETIQUETA_FRECUENCIA: Record<FrecuenciaPago, string> = {
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
};

/** Estado calculado de una cuota (v_cuotas_estado), dicho como lo pide la clínica: ABONADO / POR PAGAR. */
export const ETIQUETA_CUOTA: Record<string, { etiqueta: string; tinta: "azul" | "roja" | "apagada" }> = {
  pagada: { etiqueta: "Abonada", tinta: "azul" },
  parcial: { etiqueta: "Abono parcial", tinta: "roja" },
  pendiente: { etiqueta: "Por pagar", tinta: "roja" },
  vencida: { etiqueta: "Vencida", tinta: "roja" },
  anulada: { etiqueta: "Anulada", tinta: "apagada" },
};

export const uuidValido = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);
