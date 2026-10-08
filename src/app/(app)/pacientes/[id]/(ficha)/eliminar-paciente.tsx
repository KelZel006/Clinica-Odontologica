"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { eliminarPaciente } from "../../actions";

/**
 * Para quien nunca fue paciente (reservó y no llegó, registro por error).
 * La base de datos decide si se puede: `bloqueo` trae la razón cuando no.
 */
export function EliminarPaciente({ pacienteId, nombre, bloqueo }: { pacienteId: string; nombre: string; bloqueo: string | null }) {
  const [abierto, setAbierto] = useState(false);
  const [pendiente, iniciar] = useTransition();
  const router = useRouter();

  const eliminar = () =>
    iniciar(async () => {
      const r = await eliminarPaciente(pacienteId);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(r.mensaje);
      setAbierto(false);
      router.push("/pacientes");
    });

  return (
    <>
      <Button variant="destructive" onClick={() => setAbierto(true)}>
        <Trash2Icon aria-hidden />
        Eliminar registro
      </Button>
      <Dialog open={abierto} onOpenChange={(a) => !pendiente && setAbierto(a)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{bloqueo ? "Este registro no se puede eliminar" : `¿Eliminar a ${nombre}?`}</DialogTitle>
            <DialogDescription>
              {bloqueo ??
                "Úsalo solo con personas que nunca fueron atendidas, por ejemplo, alguien que reservó y no llegó."}
            </DialogDescription>
          </DialogHeader>
          {bloqueo ? (
            <p className="text-sm text-grafito-suave">
              Los pacientes atendidos se conservan siempre: su expediente y sus pagos son parte del historial de la clínica.
            </p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm text-grafito">
              <li>Se borran su ficha y sus citas (no asistidas o canceladas).</li>
              <li>Su solicitud de la web queda como «descartada».</li>
              <li>La auditoría guarda una copia, con quién lo eliminó y cuándo.</li>
            </ul>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAbierto(false)} disabled={pendiente}>
              {bloqueo ? "Entendido" : "No eliminar"}
            </Button>
            {!bloqueo && (
              <Button variant="destructive" onClick={eliminar} disabled={pendiente}>
                {pendiente && <LoaderCircleIcon className="animate-spin" aria-hidden />}
                Sí, eliminar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
