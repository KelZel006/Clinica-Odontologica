import type { Metadata } from "next";
import { FileTextIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso, puede } from "@/lib/sesion";
import { fecha } from "@/lib/fechas";
import { SubirArchivo } from "./subir-archivo";

export const metadata: Metadata = { title: "Archivos clínicos" };

const TIPO: Record<string, string> = {
  radiografia: "Radiografía",
  tomografia: "Tomografía",
  foto: "Fotografía clínica",
  consentimiento: "Consentimiento",
  otro: "Otro",
};

export default async function ArchivosPage({ params }: PageProps<"/pacientes/[id]/archivos">) {
  const sesion = await exigirPermiso("expediente.ver");
  const { id } = await params;
  const supabase = await createClient();
  const { data: archivos, error } = await supabase
    .from("archivos_paciente")
    .select("id, tipo, storage_path, descripcion, created_at")
    .eq("paciente_id", id)
    .order("created_at", { ascending: false });

  // Enlaces temporales (1 hora): el bucket es privado.
  const rutas = (archivos ?? []).map((a) => a.storage_path);
  const { data: firmados } = rutas.length
    ? await supabase.storage.from("expedientes").createSignedUrls(rutas, 3600)
    : { data: [] };
  const url = new Map((firmados ?? []).map((f) => [f.path, f.signedUrl]));

  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">
          Archivos clínicos <span className="cifras font-normal text-grafito-suave">({archivos?.length ?? 0})</span>
        </h2>
      </div>

      {puede(sesion, "expediente.editar") && <SubirArchivo pacienteId={id} />}

      {error ? (
        <p role="alert" className="mt-4 rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
          No se pudieron cargar los archivos. Recarga la página.
        </p>
      ) : !archivos?.length ? (
        <div className="mt-4 rounded-md border border-dashed border-linea-fuerte px-5 py-8 text-center">
          <p className="font-medium">Sin archivos todavía.</p>
          <p className="mt-1 text-sm text-grafito-suave">Radiografías, tomografías, fotos clínicas y consentimientos firmados.</p>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3">
          {archivos.map((a) => {
            const enlace = url.get(a.storage_path);
            const esImagen = /\.(jpe?g|png|webp)$/i.test(a.storage_path);
            return (
              <li key={a.id} className="overflow-hidden rounded-md border border-linea bg-superficie">
                <a href={enlace ?? "#"} target="_blank" rel="noreferrer" className="group block">
                  <div className="flex aspect-[4/3] items-center justify-center bg-[#0f1b2a]">
                    {esImagen && enlace ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal de Storage
                      <img src={enlace} alt={a.descripcion ?? TIPO[a.tipo]} className="size-full object-contain transition-opacity group-hover:opacity-90" loading="lazy" />
                    ) : (
                      <FileTextIcon className="size-10 text-marino-texto" aria-hidden />
                    )}
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-medium group-hover:underline">{TIPO[a.tipo] ?? a.tipo}</p>
                    <p className="truncate text-[0.8125rem] text-grafito-suave">{a.descripcion ?? "Sin descripción"}</p>
                    <p className="cifras mt-0.5 text-[0.75rem] text-grafito-suave">{fecha(a.created_at)}</p>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
