import type { Database } from "@/types/database.types";

export type EstadoCita = Database["public"]["Enums"]["estado_cita"];
export type EstadoSolicitud = Database["public"]["Enums"]["estado_solicitud"];

export type CitaAgenda = {
  id: string;
  inicio: string;
  fin: string;
  estado: EstadoCita;
  motivo: string | null;
  notas: string | null;
  origen: string;
  confirmadaAt: string | null;
  recordatorioEnviadoAt: string | null;
  motivoCancelacion: string | null;
  doctorId: string;
  paciente: { id: string; nombre: string; telefono: string; expediente: number };
  tratamiento: string | null;
};

export type SolicitudAgenda = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string | null;
  motivo: string | null;
  tratamientoId: string | null;
  tratamiento: string | null;
  fechaPreferida: string | null;
  horarioPreferido: string | null;
  estado: EstadoSolicitud;
  origen: string;
  creadaAt: string;
};

export type DoctorAgenda = { id: string; nombre: string };

export type TratamientoOpcion = { id: string; slug: string; nombre: string; duracion: number };

export type BloqueoAgenda = { id: string; doctorId: string; inicio: string; fin: string; motivo: string | null };

/** Qué tinta lleva cada estado. Azul = confirmado o hecho; rojo = por confirmar. */
export const ESTADOS: Record<EstadoCita, { etiqueta: string; tinta: "roja" | "azul" | "azul-solida" | "apagada" }> = {
  pendiente: { etiqueta: "Por confirmar", tinta: "roja" },
  confirmada: { etiqueta: "Confirmada", tinta: "azul" },
  completada: { etiqueta: "Atendida", tinta: "azul-solida" },
  cancelada: { etiqueta: "Cancelada", tinta: "apagada" },
  no_asistio: { etiqueta: "No asistió", tinta: "apagada" },
  reprogramada: { etiqueta: "Reprogramada", tinta: "apagada" },
};

export const ACTIVAS: EstadoCita[] = ["pendiente", "confirmada", "completada"];

export type Resultado = { ok: true; mensaje?: string } | { ok: false; error: string };
