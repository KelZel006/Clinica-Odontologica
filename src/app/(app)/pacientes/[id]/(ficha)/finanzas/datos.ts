import type { EstadoPlan, FrecuenciaPago, MetodoPago } from "@/lib/finanzas";

export type Partida = {
  id: string;
  tratamientoId: string | null;
  descripcion: string;
  pieza: number | null;
  cantidad: number;
  precio: number;
  completado: boolean;
};

export type Cuota = {
  id: string;
  numero: number;
  vencimiento: string;
  monto: number;
  abonado: number;
  pendiente: number;
  estado: string;
};

export type PlanPago = {
  id: string;
  montoTotal: number;
  prima: number;
  numeroCuotas: number;
  frecuencia: FrecuenciaPago;
  fechaInicio: string;
  cuotas: Cuota[];
};

export type Abono = {
  id: string;
  planId: string | null;
  cuotaId: string | null;
  monto: number;
  metodo: MetodoPago;
  referencia: string | null;
  recibo: number;
  pagadoAt: string;
  concepto: string;
  notas: string | null;
  anulado: boolean;
  motivoAnulacion: string | null;
  recibidoPor: string | null;
};

export type Plan = {
  id: string;
  titulo: string;
  estado: EstadoPlan;
  descuento: number;
  notas: string | null;
  creadoAt: string;
  doctor: string | null;
  partidas: Partida[];
  costoTotal: number;
  abonado: number;
  porPagar: number;
  planPago: PlanPago | null;
};
