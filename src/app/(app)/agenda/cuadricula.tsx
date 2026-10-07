"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { etiquetaMinutos, hora, minutosDeHora, minutosDelDia, rangoDia } from "@/lib/fechas";
import type { HorarioDia } from "./agenda-dia";
import { ESTADOS, type BloqueoAgenda, type CitaAgenda, type DoctorAgenda } from "./tipos";

const PX_HORA = 76;
const px = (min: number) => (min / 60) * PX_HORA;

type Props = {
  fecha: string;
  hoy: string;
  doctores: DoctorAgenda[];
  horarios: HorarioDia[];
  citas: CitaAgenda[];
  bloqueos: BloqueoAgenda[];
  onAbrirCita: (id: string) => void;
  onHuecoLibre?: (hora: string, doctorId: string) => void;
};

/** Reparte en carriles las citas que se cruzan (solo pasa con citas ya atendidas). */
function carriles(citas: CitaAgenda[]) {
  const ordenadas = [...citas].sort((a, b) => a.inicio.localeCompare(b.inicio));
  const res = new Map<string, { carril: number; total: number }>();
  let grupo: CitaAgenda[] = [];
  let finGrupo = "";
  const cerrar = () => {
    const finCarril: string[] = [];
    const asignado = grupo.map((c) => {
      let i = finCarril.findIndex((f) => f <= c.inicio);
      if (i === -1) i = finCarril.push(c.fin) - 1;
      else finCarril[i] = c.fin;
      return [c.id, i] as const;
    });
    asignado.forEach(([id, carril]) => res.set(id, { carril, total: finCarril.length }));
  };
  for (const c of ordenadas) {
    if (grupo.length && c.inicio >= finGrupo) {
      cerrar();
      grupo = [];
    }
    grupo.push(c);
    finGrupo = c.fin > finGrupo || grupo.length === 1 ? c.fin : finGrupo;
  }
  if (grupo.length) cerrar();
  return res;
}

function useMinutoActual(activo: boolean) {
  const [minuto, setMinuto] = useState<number | null>(null);
  useEffect(() => {
    if (!activo) return;
    const actualizar = () => setMinuto(minutosDelDia(new Date()));
    actualizar();
    const id = setInterval(actualizar, 30_000);
    return () => clearInterval(id);
  }, [activo]);
  return activo ? minuto : null;
}

export function Cuadricula({ fecha, hoy, doctores, horarios, citas, bloqueos, onAbrirCita, onHuecoLibre }: Props) {
  const esHoy = fecha === hoy;
  const ahora = useMinutoActual(esHoy);
  const contenedor = useRef<HTMLDivElement>(null);
  const yaDesplazo = useRef(false);

  const atiende = horarios.length > 0;
  const minutosCitas = citas.flatMap((c) => [minutosDelDia(c.inicio), minutosDelDia(c.fin)]);
  const inicioDia = Math.floor(
    Math.min(...(atiende ? horarios.map((h) => minutosDeHora(h.inicio)) : [8 * 60]), ...minutosCitas) / 60,
  ) * 60;
  const finDia = Math.ceil(
    Math.max(...(atiende ? horarios.map((h) => minutosDeHora(h.fin)) : [18 * 60]), ...minutosCitas) / 60,
  ) * 60;
  const alto = px(finDia - inicioDia);
  const horas = Array.from({ length: (finDia - inicioDia) / 60 + 1 }, (_, i) => inicioDia + i * 60);

  // Al abrir el día de hoy, lleva la vista a la hora actual (una sola vez).
  useEffect(() => {
    if (ahora === null || yaDesplazo.current || !contenedor.current) return;
    yaDesplazo.current = true;
    const y = contenedor.current.getBoundingClientRect().top + window.scrollY + px(ahora - inicioDia) - 160;
    if (ahora > inicioDia + 90 && ahora < finDia) window.scrollTo({ top: Math.max(0, y) });
  }, [ahora, inicioDia, finDia]);

  const limites = rangoDia(fecha);
  const columnas = doctores.length ? doctores : [{ id: "", nombre: "" }];
  const varios = columnas.length > 1;

  if (!atiende && citas.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-20 text-center">
        <div>
          <p className="text-base font-medium">La clínica no atiende este día.</p>
          <p className="mt-1 text-sm text-grafito-suave">Lunes a viernes de 8:00 a 18:00 y sábado de 8:00 a 13:00.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 pt-3 pb-10 sm:px-4">
      {varios && (
        <div className="ml-16 grid gap-2 pb-2" style={{ gridTemplateColumns: `repeat(${columnas.length}, minmax(0, 1fr))` }}>
          {columnas.map((d) => (
            <p key={d.id} className="truncate px-1 text-[0.8125rem] font-semibold">
              {d.nombre}
            </p>
          ))}
        </div>
      )}

      <div ref={contenedor} className="relative flex" style={{ height: alto }}>
        {/* Margen de horas */}
        <div className="relative w-16 shrink-0" aria-hidden>
          {horas.map((m) => (
            <span
              key={m}
              className="cifras absolute right-3 -translate-y-1/2 text-[0.75rem] whitespace-nowrap text-grafito-suave"
              style={{ top: px(m - inicioDia) }}
            >
              {etiquetaMinutos(m).replace(":00", "")}
            </span>
          ))}
        </div>

        <div
          className="relative grid flex-1 gap-2"
          style={{ gridTemplateColumns: `repeat(${columnas.length}, minmax(0, 1fr))` }}
        >
          {columnas.map((doctor) => {
            const suyas = citas.filter((c) => !doctor.id || c.doctorId === doctor.id);
            const lugar = carriles(suyas);
            const franjas = horarios.filter((h) => !doctor.id || h.doctorId === doctor.id);
            return (
              <div
                key={doctor.id}
                role="group"
                aria-label={varios ? `Agenda de ${doctor.nombre}` : "Agenda del día"}
                className={cn(
                  "ficha-renglones relative rounded-md border border-linea bg-superficie",
                  onHuecoLibre && "cursor-copy",
                )}
                style={{ ["--px-hora" as string]: PX_HORA }}
                onClick={(e) => {
                  if (!onHuecoLibre || e.target !== e.currentTarget) return;
                  const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
                  const min = inicioDia + Math.floor(((y / PX_HORA) * 60) / 30) * 30;
                  const hh = String(Math.floor(min / 60)).padStart(2, "0");
                  const mm = String(min % 60).padStart(2, "0");
                  onHuecoLibre(`${hh}:${mm}`, doctor.id);
                }}
              >
                {/* Fuera del horario de atención */}
                {fueraDeHorario(franjas, inicioDia, finDia).map(([a, b]) => (
                    <div
                      key={a}
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--linea)_6px_7px)] opacity-80"
                      style={{ top: px(a - inicioDia), height: px(b - a) }}
                    />
                  ))}

                {bloqueos
                  .filter((b) => !doctor.id || b.doctorId === doctor.id)
                  .map((b) => {
                    const a = Date.parse(b.inicio) < Date.parse(limites.desde) ? inicioDia : Math.max(minutosDelDia(b.inicio), inicioDia);
                    const z = Date.parse(b.fin) >= Date.parse(limites.hasta) ? finDia : Math.min(minutosDelDia(b.fin), finDia);
                    return (
                      <div
                        key={b.id}
                        className="pointer-events-none absolute inset-x-0 flex items-start bg-[repeating-linear-gradient(135deg,var(--muted)_0_6px,var(--linea)_6px_8px)] px-3 py-1.5"
                        style={{ top: px(a - inicioDia), height: px(Math.max(z - a, 15)) }}
                      >
                        <span className="rounded-sm bg-superficie/90 px-1.5 text-[0.75rem] font-medium text-grafito-suave">
                          Bloqueado{b.motivo ? `: ${b.motivo}` : ""}
                        </span>
                      </div>
                    );
                  })}

                {suyas.map((c) => {
                  const ini = minutosDelDia(c.inicio);
                  const dur = Math.max(minutosDelDia(c.fin) - ini, 10);
                  const { carril, total } = lugar.get(c.id) ?? { carril: 0, total: 1 };
                  return (
                    <BloqueCita
                      key={c.id}
                      cita={c}
                      top={px(ini - inicioDia)}
                      alto={px(dur)}
                      izquierda={`${(carril / total) * 100}%`}
                      ancho={`${100 / total}%`}
                      onAbrir={() => onAbrirCita(c.id)}
                    />
                  );
                })}
              </div>
            );
          })}

          {ahora !== null && ahora >= inicioDia && ahora <= finDia && (
            <div
              className="pointer-events-none absolute inset-x-0 z-[1] flex items-center"
              style={{ top: px(ahora - inicioDia) }}
              aria-hidden
            >
              <span className="-ml-[5px] size-2.5 rounded-full bg-rojo" />
              <span className="h-px flex-1 bg-rojo" />
            </div>
          )}
        </div>

        {ahora !== null && ahora >= inicioDia && ahora <= finDia && (
          <span
            className="cifras pointer-events-none absolute left-0 z-10 w-14 -translate-y-1/2 rounded-sm bg-rojo py-0.5 text-center text-[0.6875rem] font-semibold text-white"
            style={{ top: px(ahora - inicioDia) }}
          >
            {etiquetaMinutos(ahora).replace(/\s?[ap]\.\s?m\./, "")}
          </span>
        )}
      </div>
    </div>
  );
}

/** Tramos del día visible que quedan fuera del horario de atención. */
function fueraDeHorario(franjas: { inicio: string; fin: string }[], desde: number, hasta: number) {
  const ordenadas = franjas
    .map((f) => [minutosDeHora(f.inicio), minutosDeHora(f.fin)] as const)
    .sort((a, b) => a[0] - b[0]);
  if (!ordenadas.length) return [[desde, hasta] as const];
  const res: (readonly [number, number])[] = [];
  let cursor = desde;
  for (const [a, b] of ordenadas) {
    if (a > cursor) res.push([cursor, a]);
    cursor = Math.max(cursor, b);
  }
  if (cursor < hasta) res.push([cursor, hasta]);
  return res;
}

function BloqueCita({
  cita,
  top,
  alto,
  izquierda,
  ancho,
  onAbrir,
}: {
  cita: CitaAgenda;
  top: number;
  alto: number;
  izquierda: string;
  ancho: string;
  onAbrir: () => void;
}) {
  const { tinta, etiqueta } = ESTADOS[cita.estado];
  // Tres tamaños: una línea (<44px), dos líneas (hasta ~1 h) y completo.
  const compacto = alto < 44;
  const amplio = alto >= 84;
  const detalle = cita.tratamiento ?? cita.motivo ?? "Sin tratamiento indicado";
  const tonoHora = cn(
    tinta === "roja" && "text-rojo",
    tinta === "azul" && "text-azul",
    tinta === "azul-solida" && "text-white/85",
  );
  const tonoDetalle = tinta === "azul-solida" ? "text-white/85" : "text-grafito-suave";

  return (
    <button
      type="button"
      onClick={onAbrir}
      className={cn(
        "group absolute z-[2] overflow-hidden rounded-[5px] border px-2.5 text-left transition-shadow duration-150 hover:z-10 hover:shadow-[0_2px_8px_rgb(11_49_87/0.14)] focus-visible:z-10",
        compacto ? "flex items-center gap-2 py-0" : "py-1.5",
        tinta === "roja" && "border-rojo/55 bg-superficie text-grafito",
        tinta === "azul" && "border-azul/35 bg-azul-fondo text-grafito",
        tinta === "azul-solida" && "border-azul bg-azul text-white",
      )}
      style={{ top: top + 1, height: alto - 2, left: `calc(${izquierda} + 4px)`, width: `calc(${ancho} - 8px)` }}
      aria-label={`${hora(cita.inicio)}, ${cita.paciente.nombre}${cita.tratamiento ? `, ${cita.tratamiento}` : ""}. ${etiqueta}.`}
    >
      {compacto ? (
        <>
          <span className={cn("cifras shrink-0 text-[0.75rem] font-semibold", tonoHora)}>{hora(cita.inicio)}</span>
          <span className="min-w-0 truncate text-[0.875rem] font-semibold">{cita.paciente.nombre}</span>
          <span className={cn("hidden min-w-0 truncate text-[0.8125rem] sm:inline", tonoDetalle)}>{detalle}</span>
        </>
      ) : amplio ? (
        <>
          <span className={cn("cifras block text-[0.75rem] font-semibold", tonoHora)}>
            {hora(cita.inicio)} – {hora(cita.fin)}
          </span>
          <span className="block truncate text-[0.9375rem] leading-snug font-semibold">{cita.paciente.nombre}</span>
          <span className={cn("block truncate text-[0.8125rem] leading-snug", tonoDetalle)}>{detalle}</span>
          <span className={cn("mt-1 block text-[0.75rem] font-medium", tonoHora, tinta === "azul-solida" && "text-white")}>
            {etiqueta}
          </span>
        </>
      ) : (
        <>
          <span className="flex min-w-0 items-baseline gap-1.5 text-[0.75rem]">
            <span className={cn("cifras shrink-0 font-semibold", tonoHora)}>{hora(cita.inicio)}</span>
            <span className={cn("truncate", tonoDetalle)}>· {detalle}</span>
          </span>
          <span className="block truncate text-[0.875rem] leading-snug font-semibold">{cita.paciente.nombre}</span>
        </>
      )}
    </button>
  );
}
