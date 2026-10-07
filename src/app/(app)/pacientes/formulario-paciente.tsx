"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LoaderCircleIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Campo } from "@/components/campo";
import { guardarPaciente, type EstadoPaciente } from "./actions";

export type DatosPaciente = Partial<Record<string, string>> & { id?: string };

export function FormularioPaciente({ inicial, volverA }: { inicial?: DatosPaciente; volverA: string }) {
  const [estado, accion, guardando] = useActionState<EstadoPaciente, FormData>(guardarPaciente, {});
  const v = (k: string) => estado.valores?.[k] ?? inicial?.[k] ?? "";
  const e = estado.errores ?? {};

  return (
    <form action={accion} className="grid gap-8" noValidate>
      {inicial?.id && <input type="hidden" name="id" value={inicial.id} />}

      <Seccion titulo="Datos generales">
        <Campo id="nombre_completo" etiqueta="Nombre completo" error={e.nombre_completo} className="sm:col-span-2">
          <Input id="nombre_completo" name="nombre_completo" defaultValue={v("nombre_completo")} aria-invalid={!!e.nombre_completo || undefined} autoComplete="off" />
        </Campo>
        <Campo id="telefono" etiqueta="Teléfono (WhatsApp)" error={e.telefono} ayuda="8 dígitos; se guarda con +504">
          <Input id="telefono" name="telefono" defaultValue={v("telefono")} inputMode="tel" placeholder="9999-8888" className="cifras" aria-invalid={!!e.telefono || undefined} />
        </Campo>
        <Campo id="correo" etiqueta="Correo" opcional>
          <Input id="correo" name="correo" type="email" defaultValue={v("correo")} inputMode="email" />
        </Campo>
        <Campo id="fecha_nacimiento" etiqueta="Fecha de nacimiento" error={e.fecha_nacimiento} opcional>
          <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" defaultValue={v("fecha_nacimiento")} className="cifras" aria-invalid={!!e.fecha_nacimiento || undefined} />
        </Campo>
        <Campo id="sexo" etiqueta="Sexo" opcional>
          <NativeSelect id="sexo" name="sexo" defaultValue={v("sexo")}>
            <option value="">Sin indicar</option>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
            <option value="otro">Otro</option>
          </NativeSelect>
        </Campo>
        <Campo id="identidad" etiqueta="DNI" error={e.identidad} opcional>
          <Input id="identidad" name="identidad" defaultValue={v("identidad")} inputMode="numeric" placeholder="0801-1990-12345" className="cifras" aria-invalid={!!e.identidad || undefined} />
        </Campo>
        <Campo id="ocupacion" etiqueta="Ocupación" opcional>
          <Input id="ocupacion" name="ocupacion" defaultValue={v("ocupacion")} />
        </Campo>
        <Campo id="direccion" etiqueta="Dirección" opcional className="sm:col-span-2">
          <Input id="direccion" name="direccion" defaultValue={v("direccion")} />
        </Campo>
      </Seccion>

      <Seccion titulo="Contacto de emergencia">
        <Campo id="contacto_emergencia" etiqueta="Nombre y parentesco" opcional>
          <Input id="contacto_emergencia" name="contacto_emergencia" defaultValue={v("contacto_emergencia")} placeholder="Ej.: María López (hija)" />
        </Campo>
        <Campo id="telefono_emergencia" etiqueta="Teléfono" error={e.telefono_emergencia} opcional>
          <Input id="telefono_emergencia" name="telefono_emergencia" defaultValue={v("telefono_emergencia")} inputMode="tel" className="cifras" aria-invalid={!!e.telefono_emergencia || undefined} />
        </Campo>
      </Seccion>

      <Seccion titulo="Salud" descripcion="Lo que el doctor debe saber antes de cualquier procedimiento.">
        <Campo id="alergias" etiqueta="Alergias" opcional className="sm:col-span-2" ayuda="Se muestra en rojo en la ficha del paciente.">
          <Textarea id="alergias" name="alergias" defaultValue={v("alergias")} rows={2} placeholder="Ej.: penicilina, látex" />
        </Campo>
        <Campo id="antecedentes_medicos" etiqueta="Antecedentes médicos" opcional className="sm:col-span-2">
          <Textarea id="antecedentes_medicos" name="antecedentes_medicos" defaultValue={v("antecedentes_medicos")} rows={3} placeholder="Ej.: diabetes tipo 2, hipertensión controlada" />
        </Campo>
        <Campo id="medicamentos_actuales" etiqueta="Medicamentos actuales" opcional className="sm:col-span-2">
          <Textarea id="medicamentos_actuales" name="medicamentos_actuales" defaultValue={v("medicamentos_actuales")} rows={2} />
        </Campo>
      </Seccion>

      <Seccion titulo="Notas internas">
        <Campo id="notas" etiqueta="Notas" opcional className="sm:col-span-2">
          <Textarea id="notas" name="notas" defaultValue={v("notas")} rows={3} />
        </Campo>
      </Seccion>

      {estado.error && (
        <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
          {estado.error}
        </p>
      )}
      {Object.keys(e).length > 0 && (
        <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
          Revisa los campos marcados en rojo.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-linea pt-5 sm:flex-row sm:justify-end">
        <Link href={volverA} className={buttonVariants({ variant: "ghost" })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={guardando}>
          {guardando && <LoaderCircleIcon className="animate-spin" aria-hidden />}
          {guardando ? "Guardando…" : inicial?.id ? "Guardar cambios" : "Registrar paciente"}
        </Button>
      </div>
    </form>
  );
}

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-x-6 gap-y-5 md:grid-cols-[13rem_1fr]">
      <div>
        <legend className="text-[0.9375rem] font-semibold">{titulo}</legend>
        {descripcion && <p className="mt-1 text-[0.8125rem] leading-relaxed text-grafito-suave">{descripcion}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
