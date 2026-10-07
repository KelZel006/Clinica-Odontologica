"use client";

import { memo } from "react";
import {
  CONDICIONES,
  ETIQUETA_CARA,
  esSuperior,
  esTemporal,
  marcasDePieza,
  mesialALaDerecha,
  nombrePieza,
  tipoPieza,
  type Cara,
  type EstadoPieza,
  type MarcaVigente,
} from "./datos";

// Geometría compartida por todas las piezas (unidades del viewBox).
export const ALTO_LATERAL = 124;
export const ALTO_OCLUSAL = 60;
const CUELLO = 70; // línea entre raíz y corona en la vista lateral (raíces hacia arriba)
const BORDE = 122; // borde oclusal/incisal

const TINTA_CONTORNO = "#7c8a99";
const ESMALTE = "url(#esmalte)";
const RAIZ = "url(#raiz)";
const RAIZ_CONTORNO = "#b7a77c";

export function anchoPieza(pieza: number) {
  const tipo = tipoPieza(pieza);
  const sup = esSuperior(pieza);
  const base =
    tipo === "molar" ? 58 : tipo === "premolar" ? 46 : tipo === "canino" ? 44 : tipo === "incisivo-central" ? (sup ? 46 : 36) : sup ? 40 : 36;
  return esTemporal(pieza) ? Math.round(base * 0.86) : base;
}

// ---------------------------------------------------------------------------
// Trazos
// ---------------------------------------------------------------------------

function trazoCorona(pieza: number, w: number) {
  const t = tipoPieza(pieza);
  const n = CUELLO;
  const b = BORDE;
  if (t === "molar") {
    return `M3,${n + 4} C1,${n + 22} 2,${b - 14} 6,${b - 4} Q${w * 0.17},${b + 2} ${w * 0.33},${b - 4} Q${w * 0.5},${b + 2} ${w * 0.67},${b - 4} Q${w * 0.83},${b + 2} ${w - 6},${b - 4} C${w - 2},${b - 14} ${w - 1},${n + 22} ${w - 3},${n + 4} Q${w / 2},${n - 5} 3,${n + 4} Z`;
  }
  if (t === "premolar") {
    return `M4,${n + 4} C2,${n + 22} 3,${b - 14} 7,${b - 5} Q${w * 0.27},${b + 2} ${w * 0.5},${b - 5} Q${w * 0.73},${b + 2} ${w - 7},${b - 5} C${w - 3},${b - 14} ${w - 2},${n + 22} ${w - 4},${n + 4} Q${w / 2},${n - 5} 4,${n + 4} Z`;
  }
  if (t === "canino") {
    return `M5,${n + 4} C2,${n + 22} 5,${b - 18} ${w / 2},${b + 1} C${w - 5},${b - 18} ${w - 2},${n + 22} ${w - 5},${n + 4} Q${w / 2},${n - 5} 5,${n + 4} Z`;
  }
  return `M5,${n + 4} C3,${n + 24} 4,${b - 8} 7,${b - 2} Q${w / 2},${b + 2} ${w - 7},${b - 2} C${w - 4},${b - 8} ${w - 3},${n + 24} ${w - 5},${n + 4} Q${w / 2},${n - 5} 5,${n + 4} Z`;
}

type Raiz = { cx: number; ancho: number; apice: number; curva: number };

function raices(pieza: number, w: number): Raiz[] {
  const t = tipoPieza(pieza);
  const sup = esSuperior(pieza);
  const corto = esTemporal(pieza) ? 18 : 0;
  if (t === "molar") {
    return sup
      ? [
          { cx: w * 0.5, ancho: w * 0.26, apice: 4 + corto, curva: 0 },
          { cx: w * 0.24, ancho: w * 0.3, apice: 10 + corto, curva: -3 },
          { cx: w * 0.76, ancho: w * 0.3, apice: 10 + corto, curva: 3 },
        ]
      : [
          { cx: w * 0.29, ancho: w * 0.34, apice: 8 + corto, curva: -2 },
          { cx: w * 0.71, ancho: w * 0.34, apice: 8 + corto, curva: 2 },
        ];
  }
  if (t === "premolar" && sup && pieza % 10 === 4) {
    return [
      { cx: w * 0.36, ancho: w * 0.32, apice: 8, curva: -1 },
      { cx: w * 0.64, ancho: w * 0.32, apice: 8, curva: 1 },
    ];
  }
  if (t === "canino") return [{ cx: w / 2, ancho: w * 0.46, apice: 0 + corto, curva: 0 }];
  if (t === "premolar") return [{ cx: w / 2, ancho: w * 0.46, apice: 6, curva: 0 }];
  return [{ cx: w / 2, ancho: w * 0.44, apice: 10 + corto, curva: 0 }];
}

function trazoRaiz({ cx, ancho, apice, curva }: Raiz) {
  const n = CUELLO;
  return `M${cx - ancho / 2},${n + 8} C${cx - ancho / 2},${n - 22} ${cx - ancho * 0.28 + curva},${apice + 16} ${cx + curva},${apice} C${cx + ancho * 0.28 + curva},${apice + 16} ${cx + ancho / 2},${n - 22} ${cx + ancho / 2},${n + 8} Z`;
}

type Forma = { exterior: string; interior: string; caja: [number, number, number, number] };

function formaOclusal(pieza: number, w: number): Forma {
  const t = tipoPieza(pieza);
  const cx = w / 2;
  const cy = ALTO_OCLUSAL / 2;
  const elipse = (rx: number, ry: number) =>
    `M${cx - rx},${cy} A${rx},${ry} 0 1 0 ${cx + rx},${cy} A${rx},${ry} 0 1 0 ${cx - rx},${cy} Z`;
  const rect = (x1: number, y1: number, x2: number, y2: number, r: number) =>
    `M${x1 + r},${y1} H${x2 - r} Q${x2},${y1} ${x2},${y1 + r} V${y2 - r} Q${x2},${y2} ${x2 - r},${y2} H${x1 + r} Q${x1},${y2} ${x1},${y2 - r} V${y1 + r} Q${x1},${y1} ${x1 + r},${y1} Z`;

  if (t === "molar") {
    const [x1, y1, x2, y2] = [w * 0.32, 18, w * 0.68, 42];
    return { exterior: rect(3, 4, w - 3, 56, 16), interior: rect(x1, y1, x2, y2, 6), caja: [x1, y1, x2, y2] };
  }
  if (t === "premolar") {
    const [rx, ry] = [w * 0.2, 9];
    return { exterior: elipse(w / 2 - 4, 24), interior: elipse(rx, ry), caja: [cx - rx, cy - ry, cx + rx, cy + ry] };
  }
  if (t === "canino") {
    const [rx, ry] = [w * 0.17, 6];
    return { exterior: elipse(w / 2 - 5, 20), interior: elipse(rx, ry), caja: [cx - rx, cy - ry, cx + rx, cy + ry] };
  }
  const [rx, ry] = [w * 0.3, 4];
  return { exterior: elipse(w / 2 - 4, 14), interior: elipse(rx, ry), caja: [cx - rx, cy - ry, cx + rx, cy + ry] };
}

// ---------------------------------------------------------------------------
// Relleno según la marca vigente
// ---------------------------------------------------------------------------

export function relleno(marca: MarcaVigente | undefined) {
  if (!marca) return "transparent";
  if (marca.hallazgo.condicion === "sano") return "transparent";
  return marca.hallazgo.estado === "planificado" ? `url(#rayado-${marca.hallazgo.condicion})` : marca.meta.color;
}

type Props = {
  pieza: number;
  x: number;
  y: number;
  estado: EstadoPieza | undefined;
  seleccionada: boolean;
  caraSeleccionada: Cara | null;
  onSeleccionar: (pieza: number, cara: Cara | null) => void;
};

/**
 * Una pieza en tres vistas apiladas: lateral externa (raíces hacia arriba), oclusal y lateral interna
 * (raíces hacia abajo). En la arcada superior la externa es vestibular y la interna palatina;
 * en la inferior, la de arriba es lingual y la de abajo vestibular, como en la ficha impresa.
 */
function DienteBase({ pieza, x, y, estado, seleccionada, caraSeleccionada, onSeleccionar }: Props) {
  const w = anchoPieza(pieza);
  const sup = esSuperior(pieza);
  const caraArriba: Cara = sup ? "vestibular" : "lingual";
  const caraAbajo: Cara = sup ? "palatina" : "vestibular";
  const yOclusal = ALTO_LATERAL + 8;
  const yAbajo = yOclusal + ALTO_OCLUSAL + 8;
  const ausente = estado?.presencia?.hallazgo.condicion === "ausente";
  const extraccion = estado?.presencia?.hallazgo.condicion === "extraccion_indicada";
  const implante = estado?.raiz.implante;
  const marcas = marcasDePieza(estado);
  const resumen = marcas.length
    ? marcas
        .map((m) => `${m.meta.etiqueta}${m.hallazgo.cara !== "completa" ? ` ${ETIQUETA_CARA[m.hallazgo.cara].toLowerCase()}` : ""}${m.hallazgo.estado === "planificado" ? " (planificado)" : ""}`)
        .join(", ")
    : "sin hallazgos";

  const elegir = (cara: Cara | null) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onSeleccionar(pieza, cara);
  };

  return (
    <g
      transform={`translate(${x},${y})`}
      role="button"
      tabIndex={0}
      aria-pressed={seleccionada}
      aria-label={`Pieza ${pieza}, ${nombrePieza(pieza)}: ${resumen}`}
      className="cursor-pointer outline-none [&:focus-visible>rect:first-child]:stroke-[#1f4fa3]"
      onClick={elegir(null)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSeleccionar(pieza, null);
        }
      }}
    >
      <rect
        x={-3}
        y={-4}
        width={w + 6}
        height={yAbajo + ALTO_LATERAL + 8}
        rx={8}
        fill={seleccionada ? "#eaf0fa" : "transparent"}
        stroke={seleccionada ? "#1f4fa3" : "transparent"}
        strokeWidth={1.5}
        className="transition-colors"
      />
      <g opacity={ausente ? 0.22 : 1}>
        <VistaLateral pieza={pieza} w={w} estado={estado} caraFrente={caraArriba} caraSel={seleccionada ? caraSeleccionada : null} elegir={elegir} id="a" />
        <g transform={`translate(0,${yOclusal})`}>
          <VistaOclusal pieza={pieza} w={w} estado={estado} caraSel={seleccionada ? caraSeleccionada : null} elegir={elegir} />
        </g>
        <g transform={`translate(0,${yAbajo + ALTO_LATERAL}) scale(1,-1)`}>
          <VistaLateral pieza={pieza} w={w} estado={estado} caraFrente={caraAbajo} caraSel={seleccionada ? caraSeleccionada : null} elegir={elegir} id="b" />
        </g>
      </g>

      {(ausente || extraccion) && !implante && (
        <g stroke={ausente ? "#586777" : CONDICIONES.extraccion_indicada.color} strokeWidth={2.5} strokeLinecap="round" pointerEvents="none">
          {[
            [6, 24, ALTO_LATERAL - 6],
            [6, yOclusal + 6, yOclusal + ALTO_OCLUSAL - 6],
            [6, yAbajo + 6, yAbajo + ALTO_LATERAL - 24],
          ].map(([m, y1, y2]) => (
            <g key={y1} strokeDasharray={estado?.presencia?.hallazgo.estado === "planificado" ? "5 4" : undefined}>
              <line x1={m} y1={y1} x2={w - m} y2={y2} />
              <line x1={w - m} y1={y1} x2={m} y2={y2} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

export const Diente = memo(DienteBase);

function VistaLateral({
  pieza,
  w,
  estado,
  caraFrente,
  caraSel,
  elegir,
  id,
}: {
  pieza: number;
  w: number;
  estado: EstadoPieza | undefined;
  caraFrente: Cara;
  caraSel: Cara | null;
  elegir: (cara: Cara | null) => (e: React.MouseEvent) => void;
  id: string;
}) {
  const clip = `corona-${pieza}-${id}`;
  const clipRaiz = `raiz-${pieza}-${id}`;
  const sup = estado?.superficies ?? {};
  const corona = estado?.corona;
  const implante = estado?.raiz.implante;
  const endodoncia = estado?.raiz.endodoncia;
  const lista = raices(pieza, w);
  const borde: Cara = ["molar", "premolar"].includes(tipoPieza(pieza)) ? "oclusal" : "incisal";
  const mesialDerecha = mesialALaDerecha(pieza);
  const lado = w * 0.26;
  const zonas: { cara: Cara; x: number; y: number; ancho: number; alto: number }[] = [
    { cara: "cervical", x: 0, y: CUELLO - 8, ancho: w, alto: 17 },
    { cara: borde, x: 0, y: BORDE - 12, ancho: w, alto: 16 },
    { cara: mesialDerecha ? "distal" : "mesial", x: 0, y: CUELLO + 9, ancho: lado, alto: BORDE - 12 - CUELLO - 9 },
    { cara: mesialDerecha ? "mesial" : "distal", x: w - lado, y: CUELLO + 9, ancho: lado, alto: BORDE - 12 - CUELLO - 9 },
    { cara: caraFrente, x: lado, y: CUELLO + 9, ancho: w - lado * 2, alto: BORDE - 12 - CUELLO - 9 },
  ];
  const trazo = trazoCorona(pieza, w);

  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <path d={trazo} />
        </clipPath>
        <clipPath id={clipRaiz}>
          {lista.map((r, i) => (
            <path key={i} d={trazoRaiz(r)} />
          ))}
        </clipPath>
      </defs>

      {/* Raíz o implante */}
      {implante ? (
        <Implante w={w} planificado={implante.hallazgo.estado === "planificado"} onClick={elegir("completa")} />
      ) : (
        <g onClick={elegir("radicular")}>
          {lista.map((r, i) => (
            <path key={i} d={trazoRaiz(r)} fill={RAIZ} stroke={RAIZ_CONTORNO} strokeWidth={1.1} />
          ))}
          {sup.radicular && (
            <rect x={0} y={0} width={w} height={CUELLO + 8} fill={relleno(sup.radicular)} opacity={0.85} clipPath={`url(#${clipRaiz})`} />
          )}
          {endodoncia &&
            lista.map((r, i) => (
              <line
                key={i}
                x1={r.cx}
                y1={CUELLO + 4}
                x2={r.cx + r.curva * 0.6}
                y2={r.apice + 9}
                stroke={CONDICIONES.endodoncia.color}
                strokeWidth={3.2}
                strokeLinecap="round"
                strokeDasharray={endodoncia.hallazgo.estado === "planificado" ? "4 3" : undefined}
              />
            ))}
          {caraSel === "radicular" && (
            <rect x={1} y={1} width={w - 2} height={CUELLO + 6} fill="none" stroke="#1f4fa3" strokeWidth={1.5} strokeDasharray="3 2" rx={4} />
          )}
        </g>
      )}

      {/* Corona con sus superficies */}
      <path d={trazo} fill={ESMALTE} />
      <g clipPath={`url(#${clip})`}>
        {corona ? (
          <rect x={0} y={CUELLO - 10} width={w} height={BORDE - CUELLO + 14} fill={relleno(corona)} onClick={elegir("completa")} />
        ) : (
          zonas.map((z) => (
            <rect
              key={z.cara + z.x}
              x={z.x}
              y={z.y}
              width={z.ancho}
              height={z.alto}
              fill={relleno(sup[z.cara])}
              stroke={caraSel === z.cara ? "#1f4fa3" : "none"}
              strokeWidth={caraSel === z.cara ? 2.5 : 0}
              onClick={elegir(z.cara)}
            >
              <title>{ETIQUETA_CARA[z.cara]}</title>
            </rect>
          ))
        )}
        {Object.values(sup).some((m) => m?.hallazgo.condicion === "fractura") && !corona && (
          <path
            d={`M${w * 0.3},${CUELLO + 12} L${w * 0.5},${CUELLO + 24} L${w * 0.38},${CUELLO + 32} L${w * 0.62},${BORDE - 6}`}
            fill="none"
            stroke={CONDICIONES.fractura.color}
            strokeWidth={2}
            pointerEvents="none"
          />
        )}
      </g>
      <path d={trazo} fill="none" stroke={TINTA_CONTORNO} strokeWidth={1.2} pointerEvents="none" />
    </g>
  );
}

function Implante({ w, planificado, onClick }: { w: number; planificado: boolean; onClick: (e: React.MouseEvent) => void }) {
  const cx = w / 2;
  const iw = Math.min(w * 0.42, 20);
  const color = CONDICIONES.implante.color;
  const roscas: number[] = [];
  for (let y = 22; y < CUELLO - 2; y += 6.5) roscas.push(y);
  return (
    <g onClick={onClick}>
      {/* pilar */}
      <path d={`M${cx - iw * 0.32},${CUELLO + 8} L${cx - iw * 0.4},${CUELLO - 4} H${cx + iw * 0.4} L${cx + iw * 0.32},${CUELLO + 8} Z`} fill="#c9d6e2" stroke="#6f8597" strokeWidth={1} />
      {/* cuerpo roscado */}
      <path
        d={`M${cx - iw / 2},${CUELLO - 3} L${cx - iw / 2},28 Q${cx - iw / 2},14 ${cx},10 Q${cx + iw / 2},14 ${cx + iw / 2},28 L${cx + iw / 2},${CUELLO - 3} Z`}
        fill={planificado ? `url(#rayado-implante)` : "#d4ecf6"}
        stroke={color}
        strokeWidth={1.4}
        strokeDasharray={planificado ? "4 3" : undefined}
      />
      {roscas.map((y) => (
        <line key={y} x1={cx - iw / 2 - 2} y1={y + 3} x2={cx + iw / 2 + 2} y2={y - 1} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      ))}
    </g>
  );
}

function VistaOclusal({
  pieza,
  w,
  estado,
  caraSel,
  elegir,
}: {
  pieza: number;
  w: number;
  estado: EstadoPieza | undefined;
  caraSel: Cara | null;
  elegir: (cara: Cara | null) => (e: React.MouseEvent) => void;
}) {
  const { exterior, interior, caja } = formaOclusal(pieza, w);
  const [x1, y1, x2, y2] = caja;
  const h = ALTO_OCLUSAL;
  const sup = esSuperior(pieza);
  const mesialDerecha = mesialALaDerecha(pieza);
  const centro: Cara = ["molar", "premolar"].includes(tipoPieza(pieza)) ? "oclusal" : "incisal";
  const s = estado?.superficies ?? {};
  const corona = estado?.corona;
  const clip = `oclusal-${pieza}`;
  const regiones: { cara: Cara; puntos: string }[] = [
    { cara: sup ? "vestibular" : "lingual", puntos: `0,0 ${w},0 ${x2},${y1} ${x1},${y1}` },
    { cara: sup ? "palatina" : "vestibular", puntos: `0,${h} ${w},${h} ${x2},${y2} ${x1},${y2}` },
    { cara: mesialDerecha ? "distal" : "mesial", puntos: `0,0 ${x1},${y1} ${x1},${y2} 0,${h}` },
    { cara: mesialDerecha ? "mesial" : "distal", puntos: `${w},0 ${x2},${y1} ${x2},${y2} ${w},${h}` },
  ];

  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <path d={exterior} />
        </clipPath>
      </defs>
      <path d={exterior} fill={ESMALTE} />
      <g clipPath={`url(#${clip})`}>
        {corona ? (
          <rect x={0} y={0} width={w} height={h} fill={relleno(corona)} onClick={elegir("completa")} />
        ) : (
          regiones.map((r) => (
            <polygon
              key={r.cara}
              points={r.puntos}
              fill={relleno(s[r.cara])}
              stroke={caraSel === r.cara ? "#1f4fa3" : "#c3cdd8"}
              strokeWidth={caraSel === r.cara ? 2.5 : 0.8}
              onClick={elegir(r.cara)}
            >
              <title>{ETIQUETA_CARA[r.cara]}</title>
            </polygon>
          ))
        )}
      </g>
      {!corona && (
        <path
          d={interior}
          fill={relleno(s[centro]) === "transparent" ? ESMALTE : relleno(s[centro])}
          stroke={caraSel === centro ? "#1f4fa3" : "#9aa7b4"}
          strokeWidth={caraSel === centro ? 2.5 : 1}
          onClick={elegir(centro)}
        >
          <title>{ETIQUETA_CARA[centro]}</title>
        </path>
      )}
      {!corona && relleno(s[centro]) === "transparent" && tipoPieza(pieza) === "molar" && (
        <path
          d={`M${x1 + 3},${h / 2} H${x2 - 3} M${w / 2},${y1 + 3} V${y2 - 3} M${x1 + 3},${y1 + 4} L${w / 2},${h / 2} M${x2 - 3},${y2 - 4} L${w / 2},${h / 2}`}
          stroke="#b4c0cc"
          strokeWidth={0.9}
          strokeLinecap="round"
          fill="none"
          pointerEvents="none"
        />
      )}
      {!corona && relleno(s[centro]) === "transparent" && tipoPieza(pieza) === "premolar" && (
        <path d={`M${x1 + 2},${h / 2} H${x2 - 2}`} stroke="#b4c0cc" strokeWidth={0.9} strokeLinecap="round" pointerEvents="none" />
      )}
      <path d={exterior} fill="none" stroke={TINTA_CONTORNO} strokeWidth={1.2} pointerEvents="none" />
      {Object.values(s).some((m) => m?.hallazgo.condicion === "otro") && (
        <ellipse cx={w / 2} cy={h / 2} rx={w / 2 + 1} ry={h / 2 + 1} fill="none" stroke={CONDICIONES.otro.color} strokeWidth={1.6} strokeDasharray="4 3" pointerEvents="none" />
      )}
    </g>
  );
}
