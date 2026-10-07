"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, InboxIcon, PlusIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { diaLargo, hora, sumarDias } from "@/lib/fechas";
import { Cuadricula } from "./cuadricula";
import { DetalleCita } from "./detalle-cita";
import { NuevaCita, type Prellenado } from "./nueva-cita";
import { ListaSolicitudes } from "./solicitudes";
import { ESTADOS, type BloqueoAgenda, type CitaAgenda, type DoctorAgenda, type SolicitudAgenda, type TratamientoOpcion } from "./tipos";

export type HorarioDia = { doctorId: string; inicio: string; fin: string };

type Props = {
  fecha: string;
  hoy: string;
  puedeEditar: boolean;
  puedeEscribirNota: boolean;
  errorCarga: string | null;
  doctores: DoctorAgenda[];
  horarios: HorarioDia[];
  citas: CitaAgenda[];
  bloqueos: BloqueoAgenda[];
  solicitudes: SolicitudAgenda[];
  tratamientos: TratamientoOpcion[];
};

export function AgendaDia(props: Props) {
  const { fecha, hoy, puedeEditar, citas, solicitudes } = props;
  const router = useRouter();
  const [nueva, setNueva] = useState<Prellenado | null>(null);
  const [citaAbierta, setCitaAbierta] = useState<string | null>(null);
  const [verSolicitudes, setVerSolicitudes] = useState(false);

  const enGrilla = citas.filter((c) => ESTADOS[c.estado].tinta !== "apagada");
  const fuera = citas.filter((c) => ESTADOS[c.estado].tinta === "apagada");
  const porConfirmar = enGrilla.filter((c) => c.estado === "pendiente").length;
  const confirmadas = enGrilla.filter((c) => c.estado === "confirmada").length;
  const atendidas = enGrilla.filter((c) => c.estado === "completada").length;
  const nuevas = solicitudes.filter((s) => s.estado === "nueva").length;
  const cita = citas.find((c) => c.id === citaAbierta) ?? null;

  const irA = (f: string) => router.push(f === hoy ? "/agenda" : `/agenda?fecha=${f}`);

  const agendarSolicitud = (s: SolicitudAgenda) => {
    setVerSolicitudes(false);
    setNueva({
      fecha: s.fechaPreferida && s.fechaPreferida >= hoy ? s.fechaPreferida : fecha,
      solicitud: s,
    });
  };

  return (
    <div className="flex min-h-0 flex-1">
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-14 z-20 border-b border-linea bg-papel px-4 pt-4 pb-3 sm:px-6 md:top-0 md:pt-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="min-w-[15rem] flex-1">
              <h1 className="text-xl font-semibold first-letter:uppercase sm:text-2xl">{diaLargo(fecha)}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-md border border-linea-fuerte bg-superficie">
                <Link
                  href={sumarDias(fecha, -1) === hoy ? "/agenda" : `/agenda?fecha=${sumarDias(fecha, -1)}`}
                  className={buttonVariants({ variant: "ghost", size: "icon", className: "rounded-r-none" })}
                  aria-label="Día anterior"
                >
                  <ChevronLeftIcon />
                </Link>
                <Link
                  href="/agenda"
                  aria-current={fecha === hoy ? "date" : undefined}
                  className={buttonVariants({
                    variant: "ghost",
                    className: "rounded-none border-x border-linea px-3 aria-[current=date]:font-semibold aria-[current=date]:text-marino",
                  })}
                >
                  Hoy
                </Link>
                <Link
                  href={sumarDias(fecha, 1) === hoy ? "/agenda" : `/agenda?fecha=${sumarDias(fecha, 1)}`}
                  className={buttonVariants({ variant: "ghost", size: "icon", className: "rounded-l-none" })}
                  aria-label="Día siguiente"
                >
                  <ChevronRightIcon />
                </Link>
              </div>
              <label className="sr-only" htmlFor="ir-a-fecha">
                Ir a una fecha
              </label>
              <input
                id="ir-a-fecha"
                type="date"
                value={fecha}
                onChange={(e) => e.target.value && irA(e.target.value)}
                className="cifras hidden h-9 w-[8.75rem] rounded-md sm:block border border-linea-fuerte bg-superficie px-2.5 text-sm text-grafito"
              />
              <Button
                variant="outline"
                className="xl:hidden"
                onClick={() => setVerSolicitudes(true)}
                aria-label={`Solicitudes: ${nuevas} nuevas`}
              >
                <InboxIcon aria-hidden />
                Solicitudes
                {nuevas > 0 && (
                  <span className="cifras min-w-5 rounded-full bg-rojo px-1.5 text-xs leading-5 font-semibold text-white">
                    {nuevas}
                  </span>
                )}
              </Button>
              {puedeEditar && (
                <Button onClick={() => setNueva({ fecha: fecha < hoy ? hoy : fecha })}>
                  <PlusIcon aria-hidden />
                  Nueva cita
                </Button>
              )}
            </div>
            <p className="cifras -mt-1 flex basis-full flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-grafito-suave sm:order-none">
                <span className="whitespace-nowrap">
                  {enGrilla.length === 0 ? "Sin citas" : enGrilla.length === 1 ? "1 cita" : `${enGrilla.length} citas`}
                  {fecha === hoy ? " hoy" : ""}
                </span>
                {porConfirmar > 0 && (
                  <span className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-rojo">
                    <span aria-hidden className="size-2 rounded-full bg-rojo" />
                    {porConfirmar} por confirmar
                  </span>
                )}
                {confirmadas > 0 && (
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-azul">
                    <span aria-hidden className="size-2 rounded-full bg-azul" />
                    {confirmadas} {confirmadas === 1 ? "confirmada" : "confirmadas"}
                  </span>
                )}
                {atendidas > 0 && (
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-azul">
                    <span aria-hidden className="size-2 rounded-[2px] bg-azul" />
                    {atendidas} {atendidas === 1 ? "atendida" : "atendidas"}
                  </span>
                )}
              </p>
          </div>
        </header>

        {props.errorCarga && (
          <p role="alert" className="mx-4 mt-4 rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo sm:mx-6">
            {props.errorCarga}
          </p>
        )}

        <Cuadricula
          fecha={fecha}
          hoy={hoy}
          doctores={props.doctores}
          horarios={props.horarios}
          citas={enGrilla}
          bloqueos={props.bloqueos}
          onAbrirCita={setCitaAbierta}
          onHuecoLibre={
            puedeEditar && fecha >= hoy ? (hora, doctorId) => setNueva({ fecha, hora, doctorId }) : undefined
          }
        />

        {fuera.length > 0 && (
          <section aria-labelledby="fuera-titulo" className="px-4 pb-8 sm:px-6">
            <h2 id="fuera-titulo" className="mb-2 text-[0.8125rem] font-semibold text-grafito-suave">
              Fuera de la agenda ({fuera.length})
            </h2>
            <ul className="divide-y divide-linea rounded-md border border-linea bg-superficie">
              {fuera.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setCitaAbierta(c.id)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted"
                  >
                    <span className="cifras w-20 shrink-0 text-grafito-suave">
                      {hora(c.inicio)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-grafito-suave line-through">{c.paciente.nombre}</span>
                    <span className="shrink-0 text-[0.8125rem] text-grafito-suave">{ESTADOS[c.estado].etiqueta}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <aside
        aria-labelledby="solicitudes-titulo"
        className="sticky top-0 hidden h-dvh w-[22rem] shrink-0 flex-col border-l border-linea bg-superficie xl:flex"
      >
        <div className="flex items-baseline justify-between border-b border-linea px-5 pt-6 pb-4">
          <h2 id="solicitudes-titulo" className="text-base font-semibold">
            Solicitudes de la web
          </h2>
          {nuevas > 0 && <span className="cifras text-sm font-semibold text-rojo">{nuevas} nuevas</span>}
        </div>
        <ListaSolicitudes solicitudes={solicitudes} puedeEditar={puedeEditar} onAgendar={agendarSolicitud} />
      </aside>

      <Sheet open={verSolicitudes} onOpenChange={setVerSolicitudes}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-linea px-5 pt-5 pb-4">
            <SheetTitle className="text-base">Solicitudes de la web</SheetTitle>
          </SheetHeader>
          <ListaSolicitudes solicitudes={solicitudes} puedeEditar={puedeEditar} onAgendar={agendarSolicitud} />
        </SheetContent>
      </Sheet>

      <DetalleCita cita={cita} puedeEditar={puedeEditar} puedeEscribirNota={props.puedeEscribirNota} onCerrar={() => setCitaAbierta(null)} />

      {puedeEditar && (
        <NuevaCita
          key={nueva ? JSON.stringify(nueva) : "cerrado"}
          prellenado={nueva}
          hoy={hoy}
          tratamientos={props.tratamientos}
          onCerrar={() => setNueva(null)}
        />
      )}
    </div>
  );
}
