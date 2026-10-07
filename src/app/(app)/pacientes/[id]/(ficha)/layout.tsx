import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircleIcon, PencilIcon, TriangleAlertIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Encabezado } from "@/components/encabezado";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso, puede } from "@/lib/sesion";
import { edad } from "@/lib/fechas";
import { enlaceWhatsApp, mostrarTelefono } from "@/lib/telefono";
import { Pestanas } from "./pestanas";

export default async function FichaLayout({ children, params }: LayoutProps<"/pacientes/[id]">) {
  const sesion = await exigirPermiso("pacientes.ver");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data: p } = await supabase
    .from("pacientes")
    .select("id, nombre_completo, numero_expediente, telefono, fecha_nacimiento, alergias")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const años = edad(p.fecha_nacimiento);
  const clinico = puede(sesion, "expediente.ver");
  const finanzas = puede(sesion, "finanzas.ver") || clinico;

  return (
    <main className="flex-1">
      <Encabezado
        titulo={p.nombre_completo}
        volver={{ href: "/pacientes", etiqueta: "Pacientes" }}
        detalle={
          <span className="cifras flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Expediente N.º {p.numero_expediente}</span>
            {años !== null && <span>{años} años</span>}
            <a
              href={enlaceWhatsApp(p.telefono)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-grafito underline decoration-linea-fuerte hover:decoration-grafito"
            >
              <MessageCircleIcon className="size-3.5" aria-hidden />
              {mostrarTelefono(p.telefono)}
            </a>
            {p.alergias && (
              <span className="inline-flex max-w-full items-center gap-1 rounded-sm bg-rojo-fondo px-1.5 py-0.5 font-semibold text-rojo">
                <TriangleAlertIcon className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">Alergias: {p.alergias}</span>
              </span>
            )}
          </span>
        }
      >
        {puede(sesion, "pacientes.editar") && (
          <Link href={`/pacientes/${p.id}/editar`} className={buttonVariants({ variant: "outline" })}>
            <PencilIcon aria-hidden />
            Editar datos
          </Link>
        )}
      </Encabezado>
      {(clinico || finanzas) && <Pestanas pacienteId={p.id} clinico={clinico} finanzas={finanzas} />}
      {children}
    </main>
  );
}
