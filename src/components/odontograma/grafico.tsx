"use client";

import { CONDICIONES, PERMANENTES, TEMPORALES, type Cara, type Condicion, type EstadoPieza } from "./datos";
import { ALTO_LATERAL, ALTO_OCLUSAL, Diente, anchoPieza } from "./diente";

const MARGEN_ETIQUETAS = 96;
const SEPARACION = 6;
const LINEA_MEDIA = 22;
const ALTO_NUMERO = 42;
const ALTO_ARCADA = ALTO_NUMERO + ALTO_LATERAL + 8 + ALTO_OCLUSAL + 8 + ALTO_LATERAL + 8;
const ENTRE_ARCADAS = 34;

type Props = {
  denticion: "permanente" | "temporal";
  estados: Map<number, EstadoPieza>;
  piezaSeleccionada: number | null;
  caraSeleccionada: Cara | null;
  onSeleccionar: (pieza: number, cara: Cara | null) => void;
};

function posiciones(piezas: number[]) {
  const mitad = piezas.length / 2;
  let x = MARGEN_ETIQUETAS;
  return piezas.map((p, i) => {
    if (i === mitad) x += LINEA_MEDIA - SEPARACION;
    const pos = { pieza: p, x, w: anchoPieza(p) };
    x += pos.w + SEPARACION;
    return pos;
  });
}

/** El odontograma completo como un solo SVG: escala al ancho disponible sin perder nitidez. */
export function GraficoOdontograma({ denticion, estados, piezaSeleccionada, caraSeleccionada, onSeleccionar }: Props) {
  const juego = denticion === "permanente" ? PERMANENTES : TEMPORALES;
  const arriba = posiciones(juego.superior);
  const abajo = posiciones(juego.inferior);
  const ancho = Math.max(...[...arriba, ...abajo].map((p) => p.x + p.w)) + 12;
  const alto = ALTO_ARCADA * 2 + ENTRE_ARCADAS;
  const yInf = ALTO_ARCADA + ENTRE_ARCADAS;

  const filas = (base: number, sup: boolean) => [
    { y: base + ALTO_NUMERO + ALTO_LATERAL / 2 + 6, texto: sup ? "Vista bucal" : "Vista lingual" },
    { y: base + ALTO_NUMERO + ALTO_LATERAL + 8 + ALTO_OCLUSAL / 2 + 4, texto: "Vista oclusal" },
    { y: base + ALTO_NUMERO + ALTO_LATERAL + ALTO_OCLUSAL + 16 + ALTO_LATERAL / 2 + 2, texto: sup ? "Vista palatina" : "Vista bucal" },
  ];

  const cuadrantes =
    denticion === "permanente"
      ? { si: "Cuadrante 1 · superior derecho", sd: "Cuadrante 2 · superior izquierdo", ii: "Cuadrante 4 · inferior derecho", id: "Cuadrante 3 · inferior izquierdo" }
      : { si: "Cuadrante 5 · superior derecho", sd: "Cuadrante 6 · superior izquierdo", ii: "Cuadrante 8 · inferior derecho", id: "Cuadrante 7 · inferior izquierdo" };

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      className="h-auto w-full select-none"
      role="group"
      aria-label={`Odontograma, dentición ${denticion}`}
      style={{ fontFamily: "var(--font-public-sans)" }}
    >
      <defs>
        <linearGradient id="esmalte" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef2f6" />
          <stop offset="0.45" stopColor="#ffffff" />
          <stop offset="1" stopColor="#fbfcfd" />
        </linearGradient>
        <linearGradient id="raiz" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#efe2bf" />
          <stop offset="0.5" stopColor="#f8f1dc" />
          <stop offset="1" stopColor="#ecdcb4" />
        </linearGradient>
        {(Object.keys(CONDICIONES) as Condicion[]).map((c) => (
          <pattern key={c} id={`rayado-${c}`} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={6} height={6} fill="#ffffff" />
            <line x1={0} y1={0} x2={0} y2={6} stroke={CONDICIONES[c].color} strokeWidth={3} />
          </pattern>
        ))}
      </defs>

      {/* Línea media y separación de arcadas */}
      <line x1={MARGEN_ETIQUETAS - 8} y1={ALTO_ARCADA + ENTRE_ARCADAS / 2} x2={ancho - 4} y2={ALTO_ARCADA + ENTRE_ARCADAS / 2} stroke="#c3cdd8" />

      {[
        { base: 0, sup: true, piezas: arriba, izq: cuadrantes.si, der: cuadrantes.sd },
        { base: yInf, sup: false, piezas: abajo, izq: cuadrantes.ii, der: cuadrantes.id },
      ].map(({ base, sup, piezas, izq, der }) => {
        const medio = piezas[piezas.length / 2].x - LINEA_MEDIA / 2;
        return (
        <g key={base}>
          <line x1={medio} y1={base + 22} x2={medio} y2={base + ALTO_ARCADA - 4} stroke="#c3cdd8" strokeDasharray="4 4" />
          {filas(base, sup).map((f) => (
            <text key={f.texto + f.y} x={0} y={f.y} fontSize={11.5} fontWeight={600} fill="#586777">
              {f.texto}
            </text>
          ))}
          <text x={MARGEN_ETIQUETAS} y={base + 12} fontSize={11} fontWeight={700} fill="#0b3157">
            {izq}
          </text>
          <text x={ancho - 12} y={base + 12} fontSize={11} fontWeight={700} fill="#0b3157" textAnchor="end">
            {der}
          </text>
          {piezas.map(({ pieza, x, w }) => (
            <g key={pieza}>
              <text
                x={x + w / 2}
                y={base + ALTO_NUMERO - 6}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill={piezaSeleccionada === pieza ? "#1f4fa3" : "#24303d"}
                style={{ fontVariantNumeric: "tabular-nums" }}
                className="cursor-pointer"
                onClick={() => onSeleccionar(pieza, null)}
              >
                {pieza}
              </text>
              <Diente
                pieza={pieza}
                x={x}
                y={base + ALTO_NUMERO + 2}
                estado={estados.get(pieza)}
                seleccionada={piezaSeleccionada === pieza}
                caraSeleccionada={caraSeleccionada}
                onSeleccionar={onSeleccionar}
              />
            </g>
          ))}
        </g>
        );
      })}
    </svg>
  );
}
