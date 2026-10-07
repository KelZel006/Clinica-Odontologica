"use client";

import { useRouter } from "next/navigation";
import { sumarDias } from "@/lib/fechas";

export function FiltroPeriodo({ desde, hasta, hoy }: { desde: string; hasta: string; hoy: string }) {
  const router = useRouter();
  const ir = (d: string, h: string) => router.push(`/finanzas?desde=${d}&hasta=${h}`);
  const inicioMes = `${hoy.slice(0, 8)}01`;
  const atajos = [
    { etiqueta: "Hoy", d: hoy, h: hoy },
    { etiqueta: "7 días", d: sumarDias(hoy, -6), h: hoy },
    { etiqueta: "Este mes", d: inicioMes, h: hoy },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <div className="flex rounded-md bg-muted p-1">
        {atajos.map((a) => {
          const activo = a.d === desde && a.h === hasta;
          return (
            <button
              key={a.etiqueta}
              type="button"
              onClick={() => ir(a.d, a.h)}
              aria-pressed={activo}
              className={`h-8 rounded-[4px] px-3 text-grafito-suave transition-colors ${activo ? "bg-superficie font-medium text-grafito shadow-[0_1px_2px_rgb(36_48_61/0.12)]" : ""}`}
            >
              {a.etiqueta}
            </button>
          );
        })}
      </div>
      <label className="sr-only" htmlFor="periodo-desde">Desde</label>
      <input
        id="periodo-desde"
        type="date"
        value={desde}
        max={hasta}
        onChange={(e) => e.target.value && ir(e.target.value, hasta)}
        className="cifras h-9 rounded-md border border-linea-fuerte bg-superficie px-2 text-sm"
      />
      <span className="text-grafito-suave">a</span>
      <label className="sr-only" htmlFor="periodo-hasta">Hasta</label>
      <input
        id="periodo-hasta"
        type="date"
        value={hasta}
        min={desde}
        max={hoy}
        onChange={(e) => e.target.value && ir(desde, e.target.value)}
        className="cifras h-9 rounded-md border border-linea-fuerte bg-superficie px-2 text-sm"
      />
    </div>
  );
}
