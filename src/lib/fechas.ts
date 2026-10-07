// La clínica trabaja en America/Tegucigalpa: UTC-6 todo el año, sin horario de verano.
export const ZONA = "America/Tegucigalpa";
const OFFSET = "-06:00";

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-HN", { timeZone: ZONA, ...opts });

const fmtFechaISO = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" });
const fmtHora = fmt({ hour: "numeric", minute: "2-digit", hour12: true });

/** Espacios de no separación: "7:00 a. m." nunca se parte entre líneas. */
const sinCortes = (texto: string) => texto.replace(/\s/g, "\u00a0");
const fmtDiaLargo = fmt({ weekday: "long", day: "numeric", month: "long" });
const fmtDiaCorto = fmt({ weekday: "short", day: "numeric", month: "short" });
const fmtFecha = fmt({ day: "numeric", month: "short", year: "numeric" });

/** Fecha de hoy en la clínica, como "2026-10-06". */
export function hoyISO(ahora = new Date()) {
  return fmtFechaISO.format(ahora);
}

export function esFechaISO(valor: unknown): valor is string {
  return typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor) && !Number.isNaN(Date.parse(valor));
}

/** "2026-10-06" + "09:30" → instante UTC correcto para la clínica. */
export function instante(fechaISO: string, hora = "00:00") {
  return new Date(`${fechaISO}T${hora.length === 5 ? hora + ":00" : hora}${OFFSET}`);
}

/** Rango [inicio, fin) del día de la clínica en ISO UTC, para filtrar timestamptz. */
export function rangoDia(fechaISO: string) {
  const inicio = instante(fechaISO);
  const fin = new Date(inicio.getTime() + 24 * 3600 * 1000);
  return { desde: inicio.toISOString(), hasta: fin.toISOString() };
}

export function sumarDias(fechaISO: string, dias: number) {
  const d = instante(fechaISO, "12:00");
  d.setUTCDate(d.getUTCDate() + dias);
  return hoyISO(d);
}

/** 0 = domingo … 6 = sábado, igual que extract(dow) en la base de datos. */
export function diaSemana(fechaISO: string) {
  return new Date(`${fechaISO}T12:00:00Z`).getUTCDay();
}

/** Minutos desde la medianoche de la clínica. */
export function minutosDelDia(fecha: Date | string) {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const local = new Date(d.getTime() - 6 * 3600 * 1000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

/** "08:00:00" → 480 */
export function minutosDeHora(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function etiquetaMinutos(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return sinCortes(`${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`);
}

export const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

export const hora = (d: Date | string) => sinCortes(fmtHora.format(new Date(d)));
export const diaLargo = (fechaISO: string) => fmtDiaLargo.format(instante(fechaISO, "12:00"));
export const diaCorto = (fechaISO: string) => fmtDiaCorto.format(instante(fechaISO, "12:00"));
export const fecha = (d: Date | string) => fmtFecha.format(typeof d === "string" && esFechaISO(d) ? instante(d, "12:00") : new Date(d));

export function haceCuanto(d: Date | string, ahora = new Date()) {
  const min = Math.round((ahora.getTime() - new Date(d).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.round(h / 24);
  return dias === 1 ? "ayer" : `hace ${dias} días`;
}

export function edad(fechaNacimiento: string | null, hoy = hoyISO()) {
  if (!fechaNacimiento) return null;
  const [a, m, d] = fechaNacimiento.split("-").map(Number);
  const [ha, hm, hd] = hoy.split("-").map(Number);
  return ha - a - (hm < m || (hm === m && hd < d) ? 1 : 0);
}
