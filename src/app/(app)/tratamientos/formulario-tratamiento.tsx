"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LoaderCircleIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Campo } from "@/components/campo";
import { guardarTratamiento, type EstadoTratamiento } from "./actions";

export type DatosTratamiento = Partial<Record<string, string>> & { id?: string };

export function FormularioTratamiento({ inicial }: { inicial?: DatosTratamiento }) {
  const [estado, accion, guardando] = useActionState<EstadoTratamiento, FormData>(guardarTratamiento, {});
  const v = (k: string, d = "") => estado.valores?.[k] ?? inicial?.[k] ?? d;
  const e = estado.errores ?? {};

  return (
    <form action={accion} className="grid gap-8" noValidate>
      {inicial?.id && <input type="hidden" name="id" value={inicial.id} />}

      <Seccion titulo="Datos del tratamiento">
        <Campo id="nombre" etiqueta="Nombre" error={e.nombre} className="sm:col-span-2">
          <Input id="nombre" name="nombre" defaultValue={v("nombre")} aria-invalid={!!e.nombre || undefined} />
        </Campo>
        <Campo id="categoria" etiqueta="Categoría" opcional>
          <Input id="categoria" name="categoria" defaultValue={v("categoria")} placeholder="Implantología, Endodoncia…" />
        </Campo>
        <Campo id="precio" etiqueta="Precio de referencia (Lps)" error={e.precio} opcional>
          <Input id="precio" name="precio" inputMode="decimal" className="cifras" defaultValue={v("precio")} placeholder="1500.00" aria-invalid={!!e.precio || undefined} />
        </Campo>
        <Campo id="duracion" etiqueta="Duración de la cita (min)" error={e.duracion}>
          <Input id="duracion" name="duracion" inputMode="numeric" className="cifras" defaultValue={v("duracion", "30")} aria-invalid={!!e.duracion || undefined} />
        </Campo>
        <Campo id="orden" etiqueta="Orden en listas" error={e.orden} opcional>
          <Input id="orden" name="orden" inputMode="numeric" className="cifras" defaultValue={v("orden", "0")} />
        </Campo>
        <Campo id="descripcion" etiqueta="Descripción" opcional className="sm:col-span-2" ayuda="Si está visible en la web, este texto lo ve el paciente.">
          <Textarea id="descripcion" name="descripcion" rows={2} defaultValue={v("descripcion")} />
        </Campo>
        <div className="flex flex-wrap gap-6 sm:col-span-2">
          <Casilla nombre="activo" etiqueta="Activo (se puede agendar y cobrar)" marcado={v("activo", "on") === "on"} />
          <Casilla nombre="visible_web" etiqueta="Visible en la web pública" marcado={v("visible_web", "on") === "on"} />
        </div>
      </Seccion>

      <Seccion titulo="Información clínica" descripcion="Para el doctor y para explicar el tratamiento al paciente.">
        <Campo id="indicaciones" etiqueta="Indicaciones" opcional className="sm:col-span-2">
          <Textarea id="indicaciones" name="indicaciones" rows={2} defaultValue={v("indicaciones")} />
        </Campo>
        <Campo id="contraindicaciones" etiqueta="Contraindicaciones" opcional className="sm:col-span-2">
          <Textarea id="contraindicaciones" name="contraindicaciones" rows={2} defaultValue={v("contraindicaciones")} />
        </Campo>
        <Campo id="cuidados_posteriores" etiqueta="Cuidados posteriores" opcional className="sm:col-span-2">
          <Textarea id="cuidados_posteriores" name="cuidados_posteriores" rows={3} defaultValue={v("cuidados_posteriores")} />
        </Campo>
      </Seccion>

      {(estado.error || Object.keys(e).length > 0) && (
        <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
          {estado.error ?? "Revisa los campos marcados en rojo."}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-linea pt-5 sm:flex-row sm:justify-end">
        <Link href="/tratamientos" className={buttonVariants({ variant: "ghost" })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={guardando}>
          {guardando && <LoaderCircleIcon className="animate-spin" aria-hidden />}
          {guardando ? "Guardando…" : inicial?.id ? "Guardar cambios" : "Agregar al catálogo"}
        </Button>
      </div>
    </form>
  );
}

function Casilla({ nombre, etiqueta, marcado }: { nombre: string; etiqueta: string; marcado: boolean }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" name={nombre} defaultChecked={marcado} className="size-5 accent-[var(--tinta-azul)]" />
      {etiqueta}
    </label>
  );
}

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-x-6 gap-y-5 md:grid-cols-[13rem_1fr]">
      <div>
        <legend className="text-base font-semibold">{titulo}</legend>
        {descripcion && <p className="mt-1 text-[0.8125rem] leading-relaxed text-grafito-suave">{descripcion}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
