import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso } from "@/lib/sesion";
import { capitalizar, diaCorto, hora, hoyISO } from "@/lib/fechas";
import { FormularioNota } from "./formulario";

export const metadata: Metadata = { title: "Nueva nota clínica" };

export default async function NuevaNotaPage({ params, searchParams }: PageProps<"/pacientes/[id]/notas/nueva">) {
  await exigirPermiso("expediente.editar");
  const { id } = await params;
  const { cita } = await searchParams;

  const supabase = await createClient();
  const { data: citas } = await supabase
    .from("citas")
    .select("id, inicio, motivo, tratamientos(nombre)")
    .eq("paciente_id", id)
    .in("estado", ["pendiente", "confirmada", "completada"])
    .order("inicio", { ascending: false })
    .limit(15);

  const opciones = (citas ?? []).map((c) => ({
    id: c.id,
    etiqueta: `${capitalizar(diaCorto(hoyISO(new Date(c.inicio))))} · ${hora(c.inicio)}${c.tratamientos?.nombre ? ` · ${c.tratamientos.nombre}` : ""}`,
    motivo: c.motivo ?? c.tratamientos?.nombre ?? "",
  }));
  const citaInicial = typeof cita === "string" && opciones.some((o) => o.id === cita) ? cita : (opciones[0]?.id ?? "");

  return (
    <div className="max-w-3xl px-4 py-5 sm:px-6">
      <h2 className="mb-4 text-base font-semibold">Nueva nota clínica</h2>
      <FormularioNota pacienteId={id} citas={opciones} citaInicial={citaInicial} />
    </div>
  );
}
