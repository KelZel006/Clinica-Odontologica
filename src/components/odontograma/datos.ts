import type { Database } from "@/types/database.types";

export type Cara = Database["public"]["Enums"]["cara_dental"];
export type Condicion = Database["public"]["Enums"]["condicion_dental"];
export type EstadoHallazgo = Database["public"]["Enums"]["estado_hallazgo"];

export type Hallazgo = {
  id: string;
  pieza: number;
  cara: Cara;
  condicion: Condicion;
  estado: EstadoHallazgo;
  diagnostico: string | null;
  tratamientoId: string | null;
  tratamiento: string | null;
  observacion: string | null;
  registradoPor: string | null;
  creadoAt: string;
  anulado: boolean;
  motivoAnulacion: string | null;
};

export type Implante = {
  id: string;
  pieza: number;
  marca: string | null;
  modelo: string | null;
  diametroMm: number | null;
  longitudMm: number | null;
  fechaColocacion: string | null;
  fechaCarga: string | null;
  observaciones: string | null;
};

// ---------------------------------------------------------------------------
// Piezas (numeración FDI)
// ---------------------------------------------------------------------------

export type TipoPieza = "molar" | "premolar" | "canino" | "incisivo-central" | "incisivo-lateral";

export const PERMANENTES = {
  superior: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  inferior: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
};

export const TEMPORALES = {
  superior: [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
  inferior: [85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
};

export const cuadrante = (pieza: number) => Math.floor(pieza / 10);
export const esTemporal = (pieza: number) => cuadrante(pieza) >= 5;
export const esSuperior = (pieza: number) => [1, 2, 5, 6].includes(cuadrante(pieza));
/** Cuadrantes 1, 4, 5 y 8 se dibujan a la izquierda: su lado mesial mira a la derecha. */
export const mesialALaDerecha = (pieza: number) => [1, 4, 5, 8].includes(cuadrante(pieza));

export function tipoPieza(pieza: number): TipoPieza {
  const n = pieza % 10;
  if (esTemporal(pieza)) {
    if (n >= 4) return "molar";
    if (n === 3) return "canino";
    return n === 1 ? "incisivo-central" : "incisivo-lateral";
  }
  if (n >= 6) return "molar";
  if (n >= 4) return "premolar";
  if (n === 3) return "canino";
  return n === 1 ? "incisivo-central" : "incisivo-lateral";
}

export const esPosterior = (pieza: number) => ["molar", "premolar"].includes(tipoPieza(pieza));

const NOMBRE_TIPO: Record<number, string> = {
  1: "Incisivo central",
  2: "Incisivo lateral",
  3: "Canino",
  4: "Primer premolar",
  5: "Segundo premolar",
  6: "Primer molar",
  7: "Segundo molar",
  8: "Tercer molar",
};
const NOMBRE_TEMPORAL: Record<number, string> = {
  1: "Incisivo central temporal",
  2: "Incisivo lateral temporal",
  3: "Canino temporal",
  4: "Primer molar temporal",
  5: "Segundo molar temporal",
};
const LADO: Record<number, string> = {
  1: "superior derecho",
  2: "superior izquierdo",
  3: "inferior izquierdo",
  4: "inferior derecho",
  5: "superior derecho",
  6: "superior izquierdo",
  7: "inferior izquierdo",
  8: "inferior derecho",
};

export function nombrePieza(pieza: number) {
  const base = (esTemporal(pieza) ? NOMBRE_TEMPORAL : NOMBRE_TIPO)[pieza % 10];
  return `${base} ${LADO[cuadrante(pieza)]}`;
}

/** Superficies que se pueden marcar en una pieza, en el orden en que se ofrecen. */
export function carasDePieza(pieza: number): Cara[] {
  const interna: Cara = esSuperior(pieza) ? "palatina" : "lingual";
  return esPosterior(pieza)
    ? ["oclusal", "mesial", "distal", "vestibular", interna, "cervical", "radicular"]
    : ["incisal", "mesial", "distal", "vestibular", interna, "cervical", "radicular"];
}

export const ETIQUETA_CARA: Record<Cara, string> = {
  oclusal: "Oclusal",
  incisal: "Incisal",
  mesial: "Mesial",
  distal: "Distal",
  vestibular: "Vestibular",
  lingual: "Lingual",
  palatina: "Palatina",
  cervical: "Cervical",
  radicular: "Radicular",
  completa: "Pieza completa",
};

/** En la arcada superior, «lingual» y «palatina» son la misma cara interna. */
export function normalizarCara(pieza: number, cara: Cara): Cara {
  if (esSuperior(pieza) && cara === "lingual") return "palatina";
  if (!esSuperior(pieza) && cara === "palatina") return "lingual";
  if (!esPosterior(pieza) && cara === "oclusal") return "incisal";
  if (esPosterior(pieza) && cara === "incisal") return "oclusal";
  return cara;
}

// ---------------------------------------------------------------------------
// Condiciones: leyenda clínica
// ---------------------------------------------------------------------------

/**
 * Familia = qué parte del dibujo afecta. Hallazgos de familias distintas conviven en la misma
 * pieza (una corona sobre una endodoncia); dentro de la misma familia manda el más reciente.
 */
export type Familia = "superficie" | "corona" | "raiz" | "presencia";

export type MetaCondicion = {
  etiqueta: string;
  color: string;
  familia: Familia;
  /** Solo se registra sobre la pieza completa. */
  piezaCompleta: boolean;
  ayuda: string;
};

export const CONDICIONES: Record<Condicion, MetaCondicion> = {
  sano: { etiqueta: "Sano", color: "#ffffff", familia: "superficie", piezaCompleta: false, ayuda: "Borra lo marcado en esa superficie o en toda la pieza." },
  caries: { etiqueta: "Caries", color: "#d93636", familia: "superficie", piezaCompleta: false, ayuda: "Lesión cariosa en una o varias superficies." },
  obturado: { etiqueta: "Obturación", color: "#7d8a99", familia: "superficie", piezaCompleta: false, ayuda: "Resina o amalgama." },
  sellante: { etiqueta: "Sellante", color: "#5fa8e8", familia: "superficie", piezaCompleta: false, ayuda: "Sellante de fosas y fisuras." },
  fractura: { etiqueta: "Fractura", color: "#8a5a36", familia: "superficie", piezaCompleta: false, ayuda: "Fractura de la superficie o de la corona." },
  otro: { etiqueta: "Lesión / otro", color: "#d93636", familia: "superficie", piezaCompleta: false, ayuda: "Hallazgo descrito en la observación." },
  corona: { etiqueta: "Corona", color: "#163d7a", familia: "corona", piezaCompleta: true, ayuda: "Corona completa sobre la pieza o el implante." },
  protesis: { etiqueta: "Prótesis", color: "#7652c7", familia: "corona", piezaCompleta: true, ayuda: "Pieza de prótesis removible o fija." },
  puente: { etiqueta: "Puente", color: "#5b3fa8", familia: "corona", piezaCompleta: true, ayuda: "Pilar o póntico de un puente." },
  endodoncia: { etiqueta: "Endodoncia", color: "#ef7a1a", familia: "raiz", piezaCompleta: true, ayuda: "Tratamiento de conductos." },
  implante: { etiqueta: "Implante", color: "#1593bf", familia: "raiz", piezaCompleta: true, ayuda: "Implante dental con su ficha técnica." },
  ausente: { etiqueta: "Pieza ausente", color: "#586777", familia: "presencia", piezaCompleta: true, ayuda: "La pieza no está en boca." },
  extraccion_indicada: { etiqueta: "Extracción indicada", color: "#d93636", familia: "presencia", piezaCompleta: true, ayuda: "Pieza que debe extraerse." },
};

export const ORDEN_CONDICIONES: Condicion[] = [
  "caries",
  "obturado",
  "sellante",
  "fractura",
  "corona",
  "endodoncia",
  "implante",
  "protesis",
  "puente",
  "ausente",
  "extraccion_indicada",
  "otro",
  "sano",
];

export const ETIQUETA_ESTADO: Record<EstadoHallazgo, string> = {
  existente: "Existente",
  planificado: "Planificado",
  realizado: "Realizado",
};

// ---------------------------------------------------------------------------
// Estado actual a partir del historial
// ---------------------------------------------------------------------------

export type MarcaVigente = { hallazgo: Hallazgo; meta: MetaCondicion };

export type EstadoPieza = {
  /** Superficies con su marca vigente (caries, obturación…). */
  superficies: Partial<Record<Cara, MarcaVigente>>;
  corona?: MarcaVigente;
  raiz: Partial<Record<"endodoncia" | "implante", MarcaVigente>>;
  presencia?: MarcaVigente;
};

const vacio = (): EstadoPieza => ({ superficies: {}, raiz: {} });

/**
 * Recorre el historial (sin anulados) en orden y deja lo vigente de cada pieza.
 * «Sano» en pieza completa reinicia la pieza; «sano» en una superficie la limpia.
 */
export function estadoActual(historial: Hallazgo[]) {
  const porPieza = new Map<number, EstadoPieza>();
  const ordenados = historial
    .filter((h) => !h.anulado)
    .sort((a, b) => a.creadoAt.localeCompare(b.creadoAt));

  for (const h of ordenados) {
    const meta = CONDICIONES[h.condicion];
    const cara = normalizarCara(h.pieza, h.cara);
    const actual = porPieza.get(h.pieza) ?? vacio();
    const marca = { hallazgo: h, meta };

    if (h.condicion === "sano") {
      if (cara === "completa") porPieza.set(h.pieza, vacio());
      else {
        delete actual.superficies[cara];
        porPieza.set(h.pieza, actual);
      }
      continue;
    }

    switch (meta.familia) {
      case "superficie":
        actual.superficies[cara] = marca;
        break;
      case "corona":
        actual.corona = marca;
        break;
      case "raiz":
        actual.raiz[h.condicion as "endodoncia" | "implante"] = marca;
        // Un implante reemplaza a la pieza ausente.
        if (h.condicion === "implante" && actual.presencia?.hallazgo.condicion === "ausente") delete actual.presencia;
        break;
      case "presencia":
        actual.presencia = marca;
        break;
    }
    porPieza.set(h.pieza, actual);
  }
  return porPieza;
}

/** Lista plana de lo vigente en una pieza, para el panel y para consultas. */
export function marcasDePieza(estado: EstadoPieza | undefined): MarcaVigente[] {
  if (!estado) return [];
  return [
    estado.presencia,
    estado.corona,
    estado.raiz.implante,
    estado.raiz.endodoncia,
    ...Object.values(estado.superficies),
  ].filter((m): m is MarcaVigente => Boolean(m));
}
