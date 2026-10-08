"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Campo } from "@/components/campo";
import { leerMonto, lempiras } from "@/lib/lempiras";
import { guardarPlan, type PartidaPlan } from "../actions";

export type Sugerencia = {
  clave: string;
  tratamientoId: string | null;
  descripcion: string;
  pieza: number;
  precio: number | null;
  condicion: string;
};

type OpcionCatalogo = { id: string; nombre: string; precio: number | null };

type Inicial = { planId: string; titulo: string; descuento: string; notas: string; partidas: PartidaPlan[] };

const partidaVacia = (): PartidaPlan => ({ tratamientoId: null, descripcion: "", pieza: "", cantidad: "1", precio: "" });

export function FormularioPlan({
  pacienteId,
  catalogo,
  sugerencias,
  inicial,
}: {
  pacienteId: string;
  catalogo: OpcionCatalogo[];
  sugerencias: Sugerencia[];
  inicial: Inicial | null;
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [partidas, setPartidas] = useState<PartidaPlan[]>(inicial?.partidas.length ? inicial.partidas : [partidaVacia()]);
  const [descuento, setDescuento] = useState(inicial?.descuento ?? "");
  const [notas, setNotas] = useState(inicial?.notas ?? "");
  const [usadas, setUsadas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();

  const subtotal = partidas.reduce((s, p) => s + (Number(p.cantidad) || 0) * (leerMonto(p.precio) ?? 0), 0);
  const desc = descuento ? (leerMonto(descuento) ?? 0) : 0;
  const total = Math.max(subtotal - desc, 0);

  const cambiar = (i: number, cambios: Partial<PartidaPlan>) =>
    setPartidas((lista) => lista.map((p, j) => (j === i ? { ...p, ...cambios } : p)));

  const elegirTratamiento = (i: number, id: string) => {
    const t = catalogo.find((c) => c.id === id);
    cambiar(i, {
      tratamientoId: id || null,
      ...(t ? { descripcion: t.nombre, precio: t.precio !== null ? t.precio.toFixed(2) : "" } : {}),
    });
  };

  const agregarSugerencia = (s: Sugerencia) => {
    setUsadas((u) => [...u, s.clave]);
    setPartidas((lista) => {
      const sinVacias = lista.filter((p) => p.descripcion.trim() || p.precio.trim());
      return [
        ...sinVacias,
        { tratamientoId: s.tratamientoId, descripcion: s.descripcion, pieza: String(s.pieza), cantidad: "1", precio: s.precio !== null ? s.precio.toFixed(2) : "" },
      ];
    });
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    iniciar(async () => {
      const r = await guardarPlan({
        pacienteId,
        planId: inicial?.planId ?? null,
        titulo,
        descuento: desc ? String(desc) : "",
        notas,
        partidas: partidas
          .filter((p) => p.descripcion.trim() || p.precio.trim())
          .map((p) => ({ ...p, precio: String(leerMonto(p.precio) ?? p.precio) })),
      });
      if (!r.ok) return setError(r.error);
      toast.success(r.mensaje);
      router.push(`/pacientes/${pacienteId}/finanzas`);
    });
  };

  const pendientes = sugerencias.filter((s) => !usadas.includes(s.clave));

  return (
    <form onSubmit={guardar} className="grid gap-6" noValidate>
      <Campo id="titulo-plan" etiqueta="Título del plan">
        <Input id="titulo-plan" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej.: Implante pieza 36 y corona" className="max-w-xl" />
      </Campo>

      {pendientes.length > 0 && (
        <section className="rounded-md border border-rojo/35 bg-superficie px-4 py-3">
          <h3 className="text-sm font-semibold">Planificado en el odontograma</h3>
          <p className="text-[0.8125rem] text-grafito-suave">Toca para agregarlo como partida.</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {pendientes.map((s) => (
              <li key={s.clave}>
                <button
                  type="button"
                  onClick={() => agregarSugerencia(s)}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-linea-fuerte px-3 text-sm hover:border-azul hover:text-azul"
                >
                  <PlusIcon className="size-3.5" aria-hidden />
                  <span className="cifras font-semibold">{s.pieza}</span>
                  {s.descripcion}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-semibold">Partidas</legend>
        <p className="-mt-1 mb-1 text-[0.8125rem] text-grafito-suave">El precio es por pieza: el subtotal de cada partida es cantidad × precio por pieza.</p>
        <div className="hidden grid-cols-[minmax(10rem,14rem)_1fr_5rem_4.5rem_10rem_2.25rem] gap-2 text-[0.75rem] text-grafito-suave lg:grid">
          <span>Del catálogo</span>
          <span>Descripción</span>
          <span>Pieza</span>
          <span>Cant.</span>
          <span>Precio por pieza (Lps)</span>
          <span />
        </div>
        {partidas.map((p, i) => (
          <div key={i} className="grid gap-2 rounded-md border border-linea bg-superficie p-3 lg:grid-cols-[minmax(10rem,14rem)_1fr_5rem_4.5rem_10rem_2.25rem] lg:border-0 lg:bg-transparent lg:p-0">
            <NativeSelect aria-label={`Tratamiento de la partida ${i + 1}`} value={p.tratamientoId ?? ""} onChange={(e) => elegirTratamiento(i, e.target.value)}>
              <option value="">Otro / libre</option>
              {catalogo.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </NativeSelect>
            <Input aria-label={`Descripción de la partida ${i + 1}`} value={p.descripcion} onChange={(e) => cambiar(i, { descripcion: e.target.value })} placeholder="Descripción" />
            <Input aria-label={`Pieza de la partida ${i + 1}`} value={p.pieza} onChange={(e) => cambiar(i, { pieza: e.target.value })} inputMode="numeric" className="cifras" placeholder="Pieza" />
            <Input aria-label={`Cantidad de la partida ${i + 1}`} value={p.cantidad} onChange={(e) => cambiar(i, { cantidad: e.target.value })} inputMode="numeric" className="cifras" />
            <Input aria-label={`Precio por pieza de la partida ${i + 1}`} value={p.precio} onChange={(e) => cambiar(i, { precio: e.target.value })} inputMode="decimal" className="cifras text-right" placeholder="0.00" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Quitar la partida ${i + 1}`}
              disabled={partidas.length === 1}
              onClick={() => setPartidas((lista) => lista.filter((_, j) => j !== i))}
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => setPartidas((l) => [...l, partidaVacia()])}>
            <PlusIcon aria-hidden />
            Agregar partida
          </Button>
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
        <Campo id="notas-plan" etiqueta="Notas para el paciente o recepción" opcional>
          <Textarea id="notas-plan" rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} />
        </Campo>
        <div className="grid content-start gap-3 rounded-md border border-linea bg-superficie p-4">
          <div className="flex justify-between text-sm">
            <span className="text-grafito-suave">Subtotal</span>
            <span className="cifras">{lempiras(subtotal)}</span>
          </div>
          <Campo id="descuento-plan" etiqueta="Descuento (Lps)" opcional>
            <Input id="descuento-plan" value={descuento} onChange={(e) => setDescuento(e.target.value)} inputMode="decimal" className="cifras text-right" placeholder="0.00" />
          </Campo>
          <div className="flex items-baseline justify-between border-t border-linea pt-3">
            <span className="text-sm font-semibold">Costo total</span>
            <span className="cifras text-lg font-semibold">{lempiras(total)}</span>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-linea pt-4 sm:flex-row sm:justify-end">
        <Link href={`/pacientes/${pacienteId}/finanzas`} className={buttonVariants({ variant: "ghost" })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={guardando}>
          {guardando && <LoaderCircleIcon className="animate-spin" aria-hidden />}
          {guardando ? "Guardando…" : inicial ? "Guardar cambios" : "Crear plan"}
        </Button>
      </div>
    </form>
  );
}
