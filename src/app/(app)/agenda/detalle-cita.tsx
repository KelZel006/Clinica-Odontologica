"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckIcon, MessageCircleIcon, NotebookPenIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { capitalizar, diaLargo, fecha as fmtFecha, hora, hoyISO } from "@/lib/fechas";
import { enlaceWhatsApp, mostrarTelefono } from "@/lib/telefono";
import { cambiarEstadoCita, cancelarCita } from "./actions";
import { ESTADOS, type CitaAgenda, type EstadoCita } from "./tipos";

export function DetalleCita({
  cita,
  puedeEditar,
  puedeEscribirNota,
  onCerrar,
}: {
  cita: CitaAgenda | null;
  puedeEditar: boolean;
  puedeEscribirNota: boolean;
  onCerrar: () => void;
}) {
  return (
    <Sheet open={cita !== null} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
        {cita && <Contenido key={cita.id + cita.estado} cita={cita} puedeEditar={puedeEditar} puedeEscribirNota={puedeEscribirNota} onCerrar={onCerrar} />}
      </SheetContent>
    </Sheet>
  );
}

function Contenido({
  cita,
  puedeEditar,
  puedeEscribirNota,
  onCerrar,
}: {
  cita: CitaAgenda;
  puedeEditar: boolean;
  puedeEscribirNota: boolean;
  onCerrar: () => void;
}) {
  const [pendiente, iniciar] = useTransition();
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const { etiqueta, tinta } = ESTADOS[cita.estado];
  const fechaCita = hoyISO(new Date(cita.inicio));

  const cambiar = (a: EstadoCita, mensaje: string) =>
    iniciar(async () => {
      const r = await cambiarEstadoCita(cita.id, cita.estado, a);
      if (r.ok) toast.success(mensaje);
      else toast.error(r.error);
    });

  const cancelar = () =>
    iniciar(async () => {
      const r = await cancelarCita(cita.id, motivo);
      if (r.ok) {
        toast.success(r.mensaje);
        onCerrar();
      } else toast.error(r.error);
    });

  return (
    <>
      <SheetHeader className="border-b border-linea px-5 pt-5 pb-4">
        <SheetTitle className="pr-8 text-lg leading-snug">{cita.paciente.nombre}</SheetTitle>
        <SheetDescription className="cifras text-[0.9375rem] text-grafito">
          {capitalizar(diaLargo(fechaCita))} · {hora(cita.inicio)} – {hora(cita.fin)}
          <span
            className={cn(
              "mt-1 block text-sm font-semibold",
              tinta === "roja" && "text-rojo",
              (tinta === "azul" || tinta === "azul-solida") && "text-azul",
              tinta === "apagada" && "text-grafito-suave",
            )}
          >
            {etiqueta}
          </span>
        </SheetDescription>
      </SheetHeader>

      <div className="grid gap-5 px-5 py-5">
        <dl className="grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-2.5 text-sm">
          <dt className="text-grafito-suave">Tratamiento</dt>
          <dd>{cita.tratamiento ?? "Sin indicar"}</dd>
          <dt className="text-grafito-suave">Teléfono</dt>
          <dd>
            <a
              href={enlaceWhatsApp(cita.paciente.telefono)}
              target="_blank"
              rel="noreferrer"
              className="cifras inline-flex items-center gap-1.5 underline decoration-linea-fuerte hover:decoration-grafito"
            >
              <MessageCircleIcon className="size-4" aria-hidden />
              {mostrarTelefono(cita.paciente.telefono)}
            </a>
          </dd>
          <dt className="text-grafito-suave">Expediente</dt>
          <dd className="cifras">N.º {cita.paciente.expediente}</dd>
          {cita.motivo && (
            <>
              <dt className="text-grafito-suave">Motivo</dt>
              <dd>{cita.motivo}</dd>
            </>
          )}
          {cita.notas && (
            <>
              <dt className="text-grafito-suave">Notas</dt>
              <dd className="whitespace-pre-line">{cita.notas}</dd>
            </>
          )}
          {cita.motivoCancelacion && (
            <>
              <dt className="text-grafito-suave">Cancelación</dt>
              <dd>{cita.motivoCancelacion}</dd>
            </>
          )}
        </dl>

        <section aria-labelledby="whatsapp-titulo" className="rounded-md border border-linea px-4 py-3">
          <h3 id="whatsapp-titulo" className="text-[0.8125rem] font-semibold">
            Confirmación por WhatsApp
          </h3>
          <ul className="mt-2 grid gap-1.5 text-sm">
            <li className="flex items-center gap-2">
              <Marca hecha={Boolean(cita.recordatorioEnviadoAt)} />
              {cita.recordatorioEnviadoAt
                ? `Recordatorio enviado el ${fmtFecha(cita.recordatorioEnviadoAt)}, ${hora(cita.recordatorioEnviadoAt)}`
                : "Recordatorio aún no enviado (lo envía n8n automáticamente)"}
            </li>
            <li className="flex items-center gap-2">
              <Marca hecha={Boolean(cita.confirmadaAt)} />
              {cita.confirmadaAt
                ? `Confirmada el ${fmtFecha(cita.confirmadaAt)}, ${hora(cita.confirmadaAt)}`
                : "El paciente aún no confirma"}
            </li>
          </ul>
        </section>

        <Link
          href={`/pacientes/${cita.paciente.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-marino underline decoration-marino/30 hover:decoration-marino"
        >
          <UserRoundIcon className="size-4" aria-hidden />
          Ver ficha del paciente
        </Link>
        {puedeEscribirNota && (
          <div className="flex flex-wrap gap-2">
            <Link href={`/pacientes/${cita.paciente.id}/notas/nueva?cita=${cita.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <NotebookPenIcon aria-hidden />
              Escribir nota clínica
            </Link>
            <Link href={`/pacientes/${cita.paciente.id}/odontograma`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Odontograma
            </Link>
          </div>
        )}
      </div>

      {puedeEditar && (
        <div className="mt-auto grid gap-3 border-t border-linea px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {cita.estado === "pendiente" && (
              <>
                <Button disabled={pendiente} onClick={() => cambiar("confirmada", "Cita confirmada.")}>
                  Marcar confirmada
                </Button>
                <Button variant="outline" disabled={pendiente} onClick={() => cambiar("completada", "Cita marcada como atendida.")}>
                  Atendida
                </Button>
                <Button variant="outline" disabled={pendiente} onClick={() => cambiar("no_asistio", "Marcada como no asistió.")}>
                  No asistió
                </Button>
              </>
            )}
            {cita.estado === "confirmada" && (
              <>
                <Button disabled={pendiente} onClick={() => cambiar("completada", "Cita marcada como atendida.")}>
                  Marcar atendida
                </Button>
                <Button variant="outline" disabled={pendiente} onClick={() => cambiar("no_asistio", "Marcada como no asistió.")}>
                  No asistió
                </Button>
                <Button variant="ghost" disabled={pendiente} onClick={() => cambiar("pendiente", "Volvió a «por confirmar».")}>
                  Quitar confirmación
                </Button>
              </>
            )}
            {cita.estado === "completada" && (
              <Button variant="outline" disabled={pendiente} onClick={() => cambiar("confirmada", "Se quitó «atendida».")}>
                Deshacer «atendida»
              </Button>
            )}
            {cita.estado === "no_asistio" && (
              <Button variant="outline" disabled={pendiente} onClick={() => cambiar("pendiente", "Volvió a «por confirmar».")}>
                Volver a «por confirmar»
              </Button>
            )}
          </div>

          {(cita.estado === "pendiente" || cita.estado === "confirmada") && (
            <div className="mt-3 border-t border-dashed border-linea-fuerte pt-4">
              {!cancelando ? (
                <Button variant="destructive" size="sm" onClick={() => setCancelando(true)} disabled={pendiente}>
                  Cancelar cita
                </Button>
              ) : (
                <div className="grid gap-2">
                  <label htmlFor="motivo-cancelacion" className="text-[0.8125rem] font-medium">
                    Motivo de la cancelación <span className="font-normal text-grafito-suave">(opcional)</span>
                  </label>
                  <Textarea
                    id="motivo-cancelacion"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={2}
                    placeholder="Ej.: el paciente pidió cambiar de fecha"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={cancelar} disabled={pendiente}>
                      Sí, cancelar la cita
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCancelando(false)} disabled={pendiente}>
                      No, mantenerla
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Marca({ hecha }: { hecha: boolean }) {
  return hecha ? (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-azul text-white">
      <CheckIcon className="size-3" strokeWidth={3} aria-hidden />
    </span>
  ) : (
    <span aria-hidden className="size-4 shrink-0 rounded-full border-[1.5px] border-rojo" />
  );
}
