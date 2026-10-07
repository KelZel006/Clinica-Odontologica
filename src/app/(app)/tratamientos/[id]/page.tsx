import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Encabezado } from "@/components/encabezado";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso } from "@/lib/sesion";
import { uuidValido } from "@/lib/finanzas";
import { FormularioTratamiento } from "../formulario-tratamiento";

export const metadata: Metadata = { title: "Editar tratamiento" };

export default async function EditarTratamientoPage({ params }: PageProps<"/tratamientos/[id]">) {
  await exigirPermiso("tratamientos.editar");
  const { id } = await params;
  if (!uuidValido(id)) notFound();

  const supabase = await createClient();
  const { data: t } = await supabase.from("tratamientos").select("*").eq("id", id).maybeSingle();
  if (!t) notFound();

  return (
    <main className="flex-1">
      <Encabezado titulo={t.nombre} volver={{ href: "/tratamientos", etiqueta: "Catálogo de tratamientos" }} />
      <div className="max-w-4xl px-4 py-6 sm:px-6">
        <FormularioTratamiento
          inicial={{
            id: t.id,
            nombre: t.nombre,
            categoria: t.categoria ?? "",
            descripcion: t.descripcion ?? "",
            precio: t.precio_referencia !== null ? Number(t.precio_referencia).toFixed(2) : "",
            duracion: String(t.duracion_minutos),
            orden: String(t.orden),
            activo: t.activo ? "on" : "",
            visible_web: t.visible_web ? "on" : "",
            indicaciones: t.indicaciones ?? "",
            contraindicaciones: t.contraindicaciones ?? "",
            cuidados_posteriores: t.cuidados_posteriores ?? "",
          }}
        />
      </div>
    </main>
  );
}
