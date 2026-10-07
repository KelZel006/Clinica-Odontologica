import type { Metadata } from "next";
import { Encabezado } from "@/components/encabezado";
import { exigirPermiso } from "@/lib/sesion";
import { FormularioPaciente } from "../formulario-paciente";

export const metadata: Metadata = { title: "Nuevo paciente" };

export default async function NuevoPacientePage() {
  await exigirPermiso("pacientes.editar");

  return (
    <main className="flex-1">
      <Encabezado titulo="Nuevo paciente" volver={{ href: "/pacientes", etiqueta: "Pacientes" }} />
      <div className="max-w-4xl px-4 py-6 sm:px-6">
        <FormularioPaciente volverA="/pacientes" />
      </div>
    </main>
  );
}
