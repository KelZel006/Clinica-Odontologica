"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Campo } from "@/components/campo";
import { createClient } from "@/lib/supabase/client";
import { registrarArchivo, type TipoArchivo } from "./actions";

const MAX_MB = 50;
const PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "application/pdf", "application/dicom"];

export function SubirArchivo({ pacienteId }: { pacienteId: string }) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [tipo, setTipo] = useState<TipoArchivo>("radiografia");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subiendo, iniciar] = useTransition();

  const subir = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!archivo) return setError("Elige un archivo.");
    if (archivo.size > MAX_MB * 1024 * 1024) return setError(`El archivo pesa más de ${MAX_MB} MB.`);
    if (archivo.type && !PERMITIDOS.includes(archivo.type)) return setError("Formato no admitido: usa JPG, PNG, WEBP, PDF o DICOM.");

    iniciar(async () => {
      const extension = archivo.name.includes(".") ? archivo.name.split(".").pop()!.toLowerCase() : "bin";
      const ruta = `${pacienteId}/${crypto.randomUUID()}.${extension}`;
      const supabase = createClient();
      const { error: e } = await supabase.storage.from("expedientes").upload(ruta, archivo, { contentType: archivo.type || undefined });
      if (e) {
        setError("No se pudo subir el archivo. Revisa tu conexión e intenta de nuevo.");
        return;
      }
      const r = await registrarArchivo({ pacienteId, ruta, tipo, descripcion });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      toast.success("Archivo agregado al expediente.");
      setArchivo(null);
      setDescripcion("");
      if (entrada.current) entrada.current.value = "";
      router.refresh();
    });
  };

  return (
    <form onSubmit={subir} className="grid gap-3 rounded-md border border-linea bg-superficie p-4 md:grid-cols-[1.3fr_12rem_1fr_auto] md:items-end" noValidate>
      <Campo id="archivo" etiqueta="Archivo">
        <Input
          ref={entrada}
          id="archivo"
          type="file"
          accept={PERMITIDOS.join(",") + ",.dcm"}
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          className="h-10 py-1.5"
        />
      </Campo>
      <Campo id="tipo-archivo" etiqueta="Tipo">
        <NativeSelect id="tipo-archivo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoArchivo)}>
          <option value="radiografia">Radiografía</option>
          <option value="tomografia">Tomografía</option>
          <option value="foto">Fotografía clínica</option>
          <option value="consentimiento">Consentimiento</option>
          <option value="otro">Otro</option>
        </NativeSelect>
      </Campo>
      <Campo id="descripcion-archivo" etiqueta="Descripción" opcional>
        <Input id="descripcion-archivo" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej.: periapical pieza 36" />
      </Campo>
      <Button type="submit" disabled={subiendo || !archivo}>
        {subiendo ? <LoaderCircleIcon className="animate-spin" aria-hidden /> : <UploadIcon aria-hidden />}
        {subiendo ? "Subiendo…" : "Subir"}
      </Button>
      {error && (
        <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2 text-sm text-rojo md:col-span-4">
          {error}
        </p>
      )}
    </form>
  );
}
