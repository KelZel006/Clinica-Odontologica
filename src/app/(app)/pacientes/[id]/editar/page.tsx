import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Encabezado } from "@/components/encabezado";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso } from "@/lib/sesion";
import { mostrarTelefono } from "@/lib/telefono";
import { mostrarDNI } from "@/lib/dni";
import { FormularioPaciente } from "../../formulario-paciente";

export const metadata: Metadata = { title: "Editar paciente" };

export default async function EditarPacientePage({ params }: PageProps<"/pacientes/[id]/editar">) {
  await exigirPermiso("pacientes.editar");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data: p } = await supabase.from("pacientes").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();

  return (
    <main className="flex-1">
      <Encabezado titulo={`Editar: ${p.nombre_completo}`} volver={{ href: `/pacientes/${p.id}`, etiqueta: "Ficha del paciente" }} />
      <div className="max-w-4xl px-4 py-6 sm:px-6">
        <FormularioPaciente
          volverA={`/pacientes/${p.id}`}
          inicial={{
            id: p.id,
            nombre_completo: p.nombre_completo,
            telefono: mostrarTelefono(p.telefono),
            correo: p.correo ?? "",
            fecha_nacimiento: p.fecha_nacimiento ?? "",
            sexo: p.sexo ?? "",
            identidad: p.identidad ? mostrarDNI(p.identidad) : "",
            ocupacion: p.ocupacion ?? "",
            direccion: p.direccion ?? "",
            contacto_emergencia: p.contacto_emergencia ?? "",
            telefono_emergencia: p.telefono_emergencia ? mostrarTelefono(p.telefono_emergencia) : "",
            alergias: p.alergias ?? "",
            antecedentes_medicos: p.antecedentes_medicos ?? "",
            medicamentos_actuales: p.medicamentos_actuales ?? "",
            notas: p.notas ?? "",
          }}
        />
      </div>
    </main>
  );
}
