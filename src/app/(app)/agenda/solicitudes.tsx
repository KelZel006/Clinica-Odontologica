"use client";

import { useTransition } from "react";
import { CalendarPlusIcon, EllipsisVerticalIcon, MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { diaCorto, haceCuanto } from "@/lib/fechas";
import { enlaceWhatsApp, mostrarTelefono, normalizarTelefono } from "@/lib/telefono";
import { marcarSolicitud } from "./actions";
import type { SolicitudAgenda } from "./tipos";

export function ListaSolicitudes({
  solicitudes,
  puedeEditar,
  onAgendar,
}: {
  solicitudes: SolicitudAgenda[];
  puedeEditar: boolean;
  onAgendar: (s: SolicitudAgenda) => void;
}) {
  if (solicitudes.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm font-medium">No hay solicitudes pendientes.</p>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-grafito-suave">
          Las que lleguen desde el chat de la web aparecerán aquí para convertirlas en citas.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex-1 divide-y divide-linea overflow-y-auto">
      {solicitudes.map((s) => (
        <Solicitud key={s.id} solicitud={s} puedeEditar={puedeEditar} onAgendar={() => onAgendar(s)} />
      ))}
    </ul>
  );
}

function Solicitud({
  solicitud: s,
  puedeEditar,
  onAgendar,
}: {
  solicitud: SolicitudAgenda;
  puedeEditar: boolean;
  onAgendar: () => void;
}) {
  const [pendiente, iniciar] = useTransition();
  const telefono = normalizarTelefono(s.telefono) ?? s.telefono;
  const esNueva = s.estado === "nueva";

  const marcar = (estado: "contactada" | "descartada" | "nueva") =>
    iniciar(async () => {
      const r = await marcarSolicitud(s.id, estado);
      if (!r.ok) toast.error(r.error);
      else if (estado === "descartada") {
        toast("Solicitud descartada.", {
          action: { label: "Deshacer", onClick: () => void marcarSolicitud(s.id, "nueva") },
        });
      }
    });

  const preferencia = [s.fechaPreferida && diaCorto(s.fechaPreferida), s.horarioPreferido].filter(Boolean).join(" · ");

  return (
    <li className={cn("px-5 py-4 transition-opacity", pendiente && "opacity-50")}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn("mt-1.5 size-2 shrink-0 rounded-full", esNueva ? "bg-rojo" : "border border-grafito-suave")}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[0.9375rem] font-semibold">{s.nombre}</p>
            <span className="shrink-0 text-[0.75rem] text-grafito-suave" suppressHydrationWarning>
              {haceCuanto(s.creadaAt)}
            </span>
          </div>
          <p className="mt-0.5 text-[0.8125rem] text-grafito-suave">
            <span className={cn("font-medium", esNueva ? "text-rojo" : "text-grafito-suave")}>
              {esNueva ? "Nueva" : "Contactada"}
            </span>
            {" · "}
            <a
              href={enlaceWhatsApp(telefono)}
              target="_blank"
              rel="noreferrer"
              className="cifras inline-flex items-center gap-1 text-grafito underline decoration-linea-fuerte hover:decoration-grafito"
            >
              <MessageCircleIcon className="size-3.5" aria-hidden />
              {mostrarTelefono(telefono)}
            </a>
          </p>

          {(s.tratamiento || s.motivo) && (
            <p className="mt-2 text-sm leading-snug">
              {s.tratamiento && <span className="font-medium">{s.tratamiento}</span>}
              {s.tratamiento && s.motivo && <span className="text-grafito-suave"> — </span>}
              {s.motivo && <span className="text-grafito-suave">{s.motivo}</span>}
            </p>
          )}
          {preferencia && (
            <p className="mt-1 text-[0.8125rem] text-grafito-suave">
              Prefiere: <span className="text-grafito">{preferencia}</span>
            </p>
          )}

          {puedeEditar && (
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" onClick={onAgendar} disabled={pendiente}>
                <CalendarPlusIcon aria-hidden />
                Agendar
              </Button>
              {esNueva && (
                <Button size="sm" variant="outline" onClick={() => marcar("contactada")} disabled={pendiente}>
                  Ya la contacté
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button size="icon-sm" variant="ghost" className="ml-auto" aria-label="Más acciones" />}
                >
                  <EllipsisVerticalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  {!esNueva && <DropdownMenuItem onClick={() => marcar("nueva")}>Volver a «nueva»</DropdownMenuItem>}
                  {!esNueva && <DropdownMenuSeparator />}
                  <DropdownMenuItem variant="destructive" onClick={() => marcar("descartada")}>
                    Descartar solicitud
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
