import type { Metadata } from "next";
import { Encabezado } from "@/components/encabezado";
import { exigirPermiso } from "@/lib/sesion";
import { FormularioTratamiento } from "../formulario-tratamiento";

export const metadata: Metadata = { title: "Nuevo tratamiento" };

export default async function NuevoTratamientoPage() {
  await exigirPermiso("tratamientos.editar");
  return (
    <main className="flex-1">
      <Encabezado titulo="Nuevo tratamiento" volver={{ href: "/tratamientos", etiqueta: "Catálogo de tratamientos" }} />
      <div className="max-w-4xl px-4 py-6 sm:px-6">
        <FormularioTratamiento />
      </div>
    </main>
  );
}
