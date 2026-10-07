"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { cn } from "cn";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { GraficoOdontograma } from "@/components/odontograma/grafico";
import {
  CONDICIONES,
  ETIQUETA_CARA,
  ORDEN_CONDICIONES,
  esTemporal,
  estadoActual,
  marcasDePieza,
  type Cara,
  type EstadoPieza,
  type Hallazgo,
  type Implante,
} from "@/components/odontograma/datos";
import { Muestra } from "@/components/odontograma/muestra";
import { PanelPieza } from "./panel-pieza";

export type TratamientoOpcion = { id: string; nombre: string };

type Props = {
  pacienteId: string;
  hallazgos: Hallazgo[];
  implantes: Implante[];
  tratamientos: TratamientoOpcion[];
  puedeEditar: boolean;
  errorCarga: string | null;
};

export function OdontogramaPaciente({ pacienteId, hallazgos, implantes, tratamientos, puedeEditar, errorCarga }: Props) {
  const soloTemporales = hallazgos.length > 0 && hallazgos.every((h) => esTemporal(h.pieza));
  const [denticion, setDenticion] = useState<"permanente" | "temporal">(soloTemporales ? "temporal" : "permanente");
  const [seleccion, setSeleccion] = useState<{ pieza: number; cara: Cara | null } | null>(null);
  const estados = useMemo(() => estadoActual(hallazgos), [hallazgos]);
  const hayTemporales = hallazgos.some((h) => esTemporal(h.pieza));
  const ancho = useAncho();

  const seleccionar = (pieza: number, cara: Cara | null) =>
    setSeleccion((s) => (s?.pieza === pieza && s.cara === cara && cara === null ? null : { pieza, cara }));

  const panel = seleccion ? (
    <PanelPieza
      key={seleccion.pieza}
      pacienteId={pacienteId}
      pieza={seleccion.pieza}
      caraInicial={seleccion.cara}
      estado={estados.get(seleccion.pieza)}
      historial={hallazgos.filter((h) => h.pieza === seleccion.pieza)}
      implante={implantes.find((i) => i.pieza === seleccion.pieza) ?? null}
      tratamientos={tratamientos}
      puedeEditar={puedeEditar}
      onCerrar={() => setSeleccion(null)}
    />
  ) : (
    <Resumen estados={estados} implantes={implantes} onElegir={(p) => setSeleccion({ pieza: p, cara: null })} />
  );

  return (
    <div className="grid gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
      <section aria-labelledby="odontograma-titulo" className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="odontograma-titulo" className="text-base font-semibold">
            Odontograma
            <span className="ml-2 text-[0.8125rem] font-normal text-grafito-suave">
              {puedeEditar ? "Toca una pieza o una superficie para registrar." : "Toca una pieza para ver su historial."}
            </span>
          </h2>
          <div role="radiogroup" aria-label="Dentición" className="grid grid-cols-2 rounded-md bg-muted p-1 text-sm">
            {(["permanente", "temporal"] as const).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={denticion === d}
                onClick={() => {
                  setDenticion(d);
                  setSeleccion(null);
                }}
                className={cn(
                  "h-8 rounded-[4px] px-3 text-grafito-suave transition-colors",
                  denticion === d && "bg-superficie font-medium text-grafito shadow-[0_1px_2px_rgb(36_48_61/0.12)]",
                )}
              >
                {d === "permanente" ? "Permanente" : "Temporal"}
                {d === "temporal" && hayTemporales && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-azul align-middle" />}
              </button>
            ))}
          </div>
        </div>

        {errorCarga && (
          <p role="alert" className="mb-3 rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
            {errorCarga}
          </p>
        )}

        <div className="overflow-x-auto rounded-md border border-linea bg-superficie p-3 sm:p-4">
          <div className="min-w-[44rem]">
            <GraficoOdontograma
              denticion={denticion}
              estados={estados}
              piezaSeleccionada={seleccion?.pieza ?? null}
              caraSeleccionada={seleccion?.cara ?? null}
              onSeleccionar={seleccionar}
            />
          </div>
        </div>

        <Leyenda />
      </section>

      {/* Escritorio ancho: panel fijo a la derecha. Tablet y teléfono: hoja lateral. */}
      <aside className="hidden rounded-md border border-linea bg-superficie xl:sticky xl:top-4 xl:block">{panel}</aside>
      <Sheet open={seleccion !== null && !ancho} onOpenChange={(abierto) => !abierto && setSeleccion(null)}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md xl:hidden">
          <SheetTitle className="sr-only">Pieza {seleccion?.pieza}</SheetTitle>
          {seleccion && panel}
        </SheetContent>
      </Sheet>
    </div>
  );
}

const CONSULTA_ANCHO = "(min-width: 1280px)";

/** Verdadero en escritorio ancho, donde el panel va fijo y no hace falta la hoja lateral. */
function useAncho() {
  return useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia(CONSULTA_ANCHO);
      mq.addEventListener("change", avisar);
      return () => mq.removeEventListener("change", avisar);
    },
    () => window.matchMedia(CONSULTA_ANCHO).matches,
    () => false,
  );
}

function Leyenda() {
  return (
    <div className="mt-3 rounded-md border border-linea bg-superficie px-4 py-3">
      <h3 className="sr-only">Leyenda</h3>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[0.8125rem]">
        {ORDEN_CONDICIONES.filter((c) => c !== "sano").map((c) => (
          <li key={c} className="inline-flex items-center gap-1.5">
            <Muestra condicion={c} />
            {CONDICIONES[c].etiqueta}
          </li>
        ))}
      </ul>
      <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-linea pt-2.5 text-[0.8125rem] text-grafito-suave">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-3.5 rounded-[3px] border border-linea-fuerte bg-grafito-suave" /> Relleno sólido: existente o realizado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-3.5 rounded-[3px] border border-linea-fuerte bg-[repeating-linear-gradient(45deg,var(--grafito-suave)_0_2px,#fff_2px_4px)]"
          />
          Rayado o línea discontinua: planificado
        </span>
      </p>
    </div>
  );
}


function Resumen({
  estados,
  implantes,
  onElegir,
}: {
  estados: Map<number, EstadoPieza>;
  implantes: Implante[];
  onElegir: (pieza: number) => void;
}) {
  const todas = [...estados.entries()].sort(([a], [b]) => a - b).flatMap(([pieza, e]) => marcasDePieza(e).map((m) => ({ pieza, m })));
  const planificados = todas.filter(({ m }) => m.hallazgo.estado === "planificado");
  const conImplante = todas.filter(({ m }) => m.hallazgo.condicion === "implante");
  const ausentes = todas.filter(({ m }) => m.hallazgo.condicion === "ausente");
  const caries = todas.filter(({ m }) => m.hallazgo.condicion === "caries" && m.hallazgo.estado !== "planificado");

  return (
    <div>
      <div className="border-b border-linea px-4 pt-4 pb-3">
        <h2 className="text-base font-semibold">Resumen clínico</h2>
        <p className="mt-0.5 text-[0.8125rem] text-grafito-suave">Elige una pieza en el odontograma para ver su detalle.</p>
      </div>
      <Grupo onElegir={onElegir} titulo="Tratamientos planificados" items={planificados} vacio="No hay tratamientos pendientes." tono="rojo" />
      <Grupo onElegir={onElegir} titulo="Caries activas" items={caries} vacio="Sin caries registradas." tono="rojo" />
      <Grupo
        onElegir={onElegir}
        titulo="Implantes"
        items={conImplante}
        vacio={implantes.length ? "Hay fichas de implante sin hallazgo vigente." : "Sin implantes."}
      />
      <Grupo onElegir={onElegir} titulo="Piezas ausentes" items={ausentes} vacio="Ninguna registrada." />
    </div>
  );
}

type ItemResumen = { pieza: number; m: ReturnType<typeof marcasDePieza>[number] };

function Grupo({
  titulo,
  items,
  vacio,
  tono,
  onElegir,
}: {
  titulo: string;
  items: ItemResumen[];
  vacio: string;
  tono?: "rojo";
  onElegir: (pieza: number) => void;
}) {
  return (
    <section className="border-b border-linea px-4 py-3.5 last:border-b-0">
      <h3 className={cn("text-[0.8125rem] font-semibold", tono === "rojo" && items.length > 0 && "text-rojo")}>
        {titulo} <span className="cifras font-normal text-grafito-suave">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="mt-1 text-[0.8125rem] text-grafito-suave">{vacio}</p>
      ) : (
        <ul className="mt-2 grid gap-1">
          {items.map(({ pieza, m }) => (
            <li key={m.hallazgo.id}>
              <button
                type="button"
                onClick={() => onElegir(pieza)}
                className="flex w-full items-center gap-2 rounded-sm px-1.5 py-1 text-left text-sm hover:bg-muted"
              >
                <span className="cifras w-7 shrink-0 font-semibold">{pieza}</span>
                <Muestra condicion={m.hallazgo.condicion} />
                <span className="min-w-0 truncate">
                  {m.meta.etiqueta}
                  {m.hallazgo.cara !== "completa" && <span className="text-grafito-suave"> · {ETIQUETA_CARA[m.hallazgo.cara].toLowerCase()}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
