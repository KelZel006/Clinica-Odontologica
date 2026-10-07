import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso, puede } from "@/lib/sesion";
import { capitalizar, diaLargo, hora, hoyISO } from "@/lib/fechas";

export const metadata: Metadata = { title: "Notas clínicas" };

export default async function NotasPage({ params }: PageProps<"/pacientes/[id]/notas">) {
  const sesion = await exigirPermiso("expediente.ver");
  const { id } = await params;
  const supabase = await createClient();
  const { data: notas, error } = await supabase
    .from("notas_clinicas")
    .select("id, created_at, motivo_consulta, diagnostico, procedimiento_realizado, piezas_dentales, indicaciones, doctores(nombre), citas(inicio)")
    .eq("paciente_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl px-4 py-5 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">
          Notas clínicas <span className="cifras font-normal text-grafito-suave">({notas?.length ?? 0})</span>
        </h2>
        {puede(sesion, "expediente.editar") && (
          <Link href={`/pacientes/${id}/notas/nueva`} className={buttonVariants()}>
            <PlusIcon aria-hidden />
            Nueva nota
          </Link>
        )}
      </div>

      {error ? (
        <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
          No se pudieron cargar las notas. Recarga la página.
        </p>
      ) : !notas?.length ? (
        <div className="rounded-md border border-dashed border-linea-fuerte px-5 py-8 text-center">
          <p className="font-medium">Todavía no hay notas clínicas.</p>
          <p className="mt-1 text-sm text-grafito-suave">Cada consulta queda registrada aquí: motivo, diagnóstico, procedimiento e indicaciones.</p>
        </div>
      ) : (
        <ol className="grid gap-4">
          {notas.map((n) => {
            const dia = hoyISO(new Date(n.created_at));
            return (
              <li key={n.id} className="rounded-md border border-linea bg-superficie">
                <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-linea px-4 py-2.5">
                  <p className="cifras text-sm font-semibold">
                    {capitalizar(diaLargo(dia))}, {hora(n.created_at)}
                  </p>
                  <p className="text-[0.8125rem] text-grafito-suave">
                    {[n.doctores?.nombre, n.citas && `Cita de las ${hora(n.citas.inicio)}`].filter(Boolean).join(" · ") || "Sin cita asociada"}
                  </p>
                </header>
                <dl className="grid gap-x-4 gap-y-2.5 px-4 py-3 text-sm sm:grid-cols-[10rem_1fr]">
                  {(
                    [
                      ["Motivo", n.motivo_consulta],
                      ["Diagnóstico", n.diagnostico],
                      ["Procedimiento", n.procedimiento_realizado],
                      ["Piezas", n.piezas_dentales?.length ? n.piezas_dentales.join(", ") : null],
                      ["Indicaciones", n.indicaciones],
                    ] as const
                  )
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-grafito-suave">{k}</dt>
                        <dd className={k === "Piezas" ? "cifras font-medium" : "whitespace-pre-line"}>{v}</dd>
                      </div>
                    ))}
                </dl>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
