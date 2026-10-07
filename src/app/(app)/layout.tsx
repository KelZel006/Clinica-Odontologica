import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesion, puede } from "@/lib/sesion";
import { BarraLateral, BarraSuperiorMovil, NavegacionInferior, type ItemNav } from "./navegacion";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const sesion = await getSesion();
  if (sesion.permisos.length === 0) redirect("/sin-acceso");

  const items: ItemNav[] = [];
  if (puede(sesion, "citas.ver")) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("solicitudes_cita")
      .select("id", { count: "exact", head: true })
      .eq("estado", "nueva");
    items.push({ href: "/agenda", etiqueta: "Agenda", icono: "agenda", aviso: count ?? 0 });
  }
  if (puede(sesion, "pacientes.ver")) {
    items.push({ href: "/pacientes", etiqueta: "Pacientes", icono: "pacientes" });
  }

  return (
    <div className="flex min-h-dvh">
      <BarraLateral items={items} nombre={sesion.nombre} rol={sesion.rol} />
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperiorMovil nombre={sesion.nombre} />
        <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">{children}</div>
      </div>
      <NavegacionInferior items={items} />
    </div>
  );
}
