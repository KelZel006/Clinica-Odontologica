// Montos en Lempiras con el formato de la clínica: «Lps 1,500.00».
const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const lempiras = (monto: number | string | null | undefined) => `Lps ${fmt.format(Number(monto ?? 0))}`;

/** Convierte lo que escribe recepción («1,500.50», «1500,5») a número; null si no es válido. */
export function leerMonto(texto: string) {
  const limpio = texto.replace(/[^\d.,]/g, "");
  if (!limpio) return null;
  // Si trae coma y punto, la coma es separador de miles; si solo trae coma, es decimal.
  const normal = limpio.includes(".") ? limpio.replace(/,/g, "") : limpio.replace(",", ".");
  const n = Number(normal);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

// ---------------------------------------------------------------------------
// Monto en letras para el recibo: 1500.5 → «Mil quinientos lempiras con 50/100»
// ---------------------------------------------------------------------------

const UNIDADES = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
const DECENAS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

function hastaMil(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cien";
  const c = Math.floor(n / 100);
  const r = n % 100;
  let decenas = "";
  if (r < 30) decenas = UNIDADES[r];
  else decenas = DECENAS[Math.floor(r / 10)] + (r % 10 ? ` y ${UNIDADES[r % 10]}` : "");
  return [CENTENAS[c], decenas].filter(Boolean).join(" ");
}

function entero(n: number): string {
  if (n === 0) return "cero";
  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (millones) partes.push(millones === 1 ? "un millón" : `${hastaMil(millones).replace(/uno$/, "un")} millones`);
  if (miles) partes.push(miles === 1 ? "mil" : `${hastaMil(miles).replace(/uno$/, "un")} mil`);
  if (resto) partes.push(hastaMil(resto));
  return partes.join(" ");
}

export function montoEnLetras(monto: number) {
  const centavos = Math.round(monto * 100);
  const lempirasEnteros = Math.floor(centavos / 100);
  const texto = entero(lempirasEnteros).replace(/uno$/, "un");
  const frase = `${texto} ${lempirasEnteros === 1 ? "lempira" : "lempiras"} con ${String(centavos % 100).padStart(2, "0")}/100`;
  return frase.charAt(0).toUpperCase() + frase.slice(1);
}
