import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso } from "@/lib/sesion";
import { uuidValido } from "@/lib/finanzas";
import { CONDICIONES, ETIQUETA_CARA, estadoActual, marcasDePieza, type Hallazgo } from "@/components/odontograma/datos";
import { FormularioPlan, type Sugerencia } from "./formulario-plan";

export const metadata: Metadata = { title: "Plan de tratamiento" };

export default async function PlanPage({ params, searchParams }: PageProps<"/pacientes/[id]/finanzas/plan">) {
  await exigirPermiso("expediente.editar");
  const { id } = await params;
  const { editar } = await searchParams;
  const supabase = await createClient();

  const [catalogo, hallazgos, existente] = await Promise.all([
    supabase.from("tratamientos").select("id, nombre, precio_referencia").eq("activo", true).order("orden"),
    supabase
      .from("odontograma")
      .select("id, pieza, cara, condicion, estado, diagnostico, tratamiento_id, observacion, created_at, anulado, motivo_anulacion, tratamientos(nombre, precio_referencia)")
      .eq("paciente_id", id),
    uuidValido(editar)
      ? supabase
          .from("planes_tratamiento")
          .select("id, titulo, descuento, notas, estado, plan_items(tratamiento_id, descripcion, pieza, cantidad, precio_unitario, orden)")
          .eq("id", editar)
          .eq("paciente_id", id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  // Lo planificado y vigente en el odontograma se ofrece como partidas sugeridas.
  const filas = hallazgos.data ?? [];
  const lista: Hallazgo[] = filas.map((h) => ({
    id: h.id,
    pieza: h.pieza,
    cara: h.cara,
    condicion: h.condicion,
    estado: h.estado,
    diagnostico: h.diagnostico,
    tratamientoId: h.tratamiento_id,
    tratamiento: h.tratamientos?.nombre ?? null,
    observacion: h.observacion,
    registradoPor: null,
    creadoAt: h.created_at,
    anulado: h.anulado,
    motivoAnulacion: h.motivo_anulacion,
  }));
  const precio = new Map(filas.map((h) => [h.id, h.tratamientos?.precio_referencia ?? null]));
  const sugerencias: Sugerencia[] = [...estadoActual(lista).entries()]
    .flatMap(([pieza, e]) => marcasDePieza(e).map((m) => ({ pieza, m })))
    .filter(({ m }) => m.hallazgo.estado === "planificado")
    .map(({ pieza, m }) => ({
      clave: m.hallazgo.id,
      tratamientoId: m.hallazgo.tratamientoId,
      descripcion:
        m.hallazgo.tratamiento ??
        `${m.meta.etiqueta}${m.hallazgo.cara !== "completa" ? ` (${ETIQUETA_CARA[m.hallazgo.cara].toLowerCase()})` : ""}`,
      pieza,
      precio: precio.get(m.hallazgo.id) !== null && precio.get(m.hallazgo.id) !== undefined ? Number(precio.get(m.hallazgo.id)) : null,
      condicion: CONDICIONES[m.hallazgo.condicion].etiqueta,
    }));

  const plan = existente.data && existente.data.estado === "propuesto" ? existente.data : null;

  return (
    <div className="max-w-5xl px-4 py-5 sm:px-6">
      <h2 className="mb-1 text-base font-semibold">{plan ? "Editar plan de tratamiento" : "Nuevo plan de tratamiento"}</h2>
      <p className="mb-5 text-[0.8125rem] text-grafito-suave">
        El plan queda «propuesto» hasta que el paciente lo acepta. Recepción verá el costo y podrá crear el plan de pago y registrar abonos.
      </p>
      <FormularioPlan
        pacienteId={id}
        catalogo={(catalogo.data ?? []).map((t) => ({ id: t.id, nombre: t.nombre, precio: t.precio_referencia !== null ? Number(t.precio_referencia) : null }))}
        sugerencias={sugerencias}
        inicial={
          plan
            ? {
                planId: plan.id,
                titulo: plan.titulo,
                descuento: Number(plan.descuento) ? Number(plan.descuento).toFixed(2) : "",
                notas: plan.notas ?? "",
                partidas: [...(plan.plan_items ?? [])]
                  .sort((a, b) => a.orden - b.orden)
                  .map((i) => ({
                    tratamientoId: i.tratamiento_id,
                    descripcion: i.descripcion,
                    pieza: i.pieza ? String(i.pieza) : "",
                    cantidad: String(i.cantidad),
                    precio: Number(i.precio_unitario).toFixed(2),
                  })),
              }
            : null
        }
      />
    </div>
  );
}
