"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { LoaderCircleIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Campo } from "@/components/campo";
import { crearNota, type EstadoNota } from "../actions";

type OpcionCita = { id: string; etiqueta: string; motivo: string };

export function FormularioNota({ pacienteId, citas, citaInicial }: { pacienteId: string; citas: OpcionCita[]; citaInicial: string }) {
  const [estado, accion, guardando] = useActionState<EstadoNota, FormData>(crearNota, {});
  const [citaId, setCitaId] = useState(citaInicial);
  const v = (k: string, porDefecto = "") => estado.valores?.[k] ?? porDefecto;
  const motivoCita = citas.find((c) => c.id === citaId)?.motivo ?? "";

  return (
    <form action={accion} className="grid gap-5" noValidate>
      <input type="hidden" name="paciente_id" value={pacienteId} />

      <Campo id="cita_id" etiqueta="Cita" opcional ayuda="La nota queda ligada a la consulta del día.">
        <NativeSelect id="cita_id" name="cita_id" value={citaId} onChange={(e) => setCitaId(e.target.value)}>
          <option value="">Sin cita</option>
          {citas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.etiqueta}
            </option>
          ))}
        </NativeSelect>
      </Campo>

      <Campo id="motivo_consulta" etiqueta="Motivo de consulta">
        <Input id="motivo_consulta" name="motivo_consulta" key={citaId} defaultValue={v("motivo_consulta", motivoCita)} />
      </Campo>
      <Campo id="diagnostico" etiqueta="Diagnóstico">
        <Textarea id="diagnostico" name="diagnostico" rows={2} defaultValue={v("diagnostico")} />
      </Campo>
      <Campo id="procedimiento_realizado" etiqueta="Procedimiento realizado">
        <Textarea id="procedimiento_realizado" name="procedimiento_realizado" rows={3} defaultValue={v("procedimiento_realizado")} />
      </Campo>
      <Campo id="piezas" etiqueta="Piezas tratadas" opcional ayuda="Números FDI separados por coma." error={estado.errores?.piezas}>
        <Input id="piezas" name="piezas" inputMode="numeric" placeholder="36, 46" className="cifras" defaultValue={v("piezas")} aria-invalid={!!estado.errores?.piezas || undefined} />
      </Campo>
      <Campo id="indicaciones" etiqueta="Indicaciones al paciente" opcional>
        <Textarea id="indicaciones" name="indicaciones" rows={3} defaultValue={v("indicaciones")} />
      </Campo>

      {(estado.error || estado.errores?.contenido) && (
        <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
          {estado.error ?? estado.errores?.contenido}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-linea pt-4 sm:flex-row sm:justify-end">
        <Link href={`/pacientes/${pacienteId}/notas`} className={buttonVariants({ variant: "ghost" })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={guardando}>
          {guardando && <LoaderCircleIcon className="animate-spin" aria-hidden />}
          {guardando ? "Guardando…" : "Guardar nota"}
        </Button>
      </div>
    </form>
  );
}
