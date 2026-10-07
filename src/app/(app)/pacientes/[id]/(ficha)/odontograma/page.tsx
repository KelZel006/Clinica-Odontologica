import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso, puede } from "@/lib/sesion";
import type { Hallazgo, Implante } from "@/components/odontograma/datos";
import { OdontogramaPaciente } from "./odontograma-paciente";

export const metadata: Metadata = { title: "Odontograma" };

export default async function OdontogramaPage({ params }: PageProps<"/pacientes/[id]/odontograma">) {
  const sesion = await exigirPermiso("expediente.ver");
  const { id } = await params;
  const supabase = await createClient();

  const [hallazgos, implantes, tratamientos] = await Promise.all([
    supabase
      .from("odontograma")
      .select(
        "id, pieza, cara, condicion, estado, diagnostico, tratamiento_id, observacion, registrado_por, created_at, anulado, motivo_anulacion, tratamientos(nombre)",
      )
      .eq("paciente_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("implantes")
      .select("id, pieza, marca, modelo, diametro_mm, longitud_mm, fecha_colocacion, fecha_carga, observaciones")
      .eq("paciente_id", id)
      .eq("activo", true)
      .order("created_at", { ascending: false }),
    supabase.from("tratamientos").select("id, nombre").eq("activo", true).order("orden"),
  ]);

  const ids = [...new Set((hallazgos.data ?? []).map((h) => h.registrado_por).filter((v): v is string => Boolean(v)))];
  const { data: nombres } = ids.length ? await supabase.rpc("nombres_personal", { p_ids: ids }) : { data: [] };
  const nombre = new Map((nombres ?? []).map((n) => [n.id, n.nombre]));

  const lista: Hallazgo[] = (hallazgos.data ?? []).map((h) => ({
    id: h.id,
    pieza: h.pieza,
    cara: h.cara,
    condicion: h.condicion,
    estado: h.estado,
    diagnostico: h.diagnostico,
    tratamientoId: h.tratamiento_id,
    tratamiento: h.tratamientos?.nombre ?? null,
    observacion: h.observacion,
    registradoPor: h.registrado_por ? (nombre.get(h.registrado_por) ?? null) : null,
    creadoAt: h.created_at,
    anulado: h.anulado,
    motivoAnulacion: h.motivo_anulacion,
  }));

  const fichas: Implante[] = (implantes.data ?? []).map((i) => ({
    id: i.id,
    pieza: i.pieza,
    marca: i.marca,
    modelo: i.modelo,
    diametroMm: i.diametro_mm,
    longitudMm: i.longitud_mm,
    fechaColocacion: i.fecha_colocacion,
    fechaCarga: i.fecha_carga,
    observaciones: i.observaciones,
  }));

  return (
    <OdontogramaPaciente
      pacienteId={id}
      hallazgos={lista}
      implantes={fichas}
      tratamientos={(tratamientos.data ?? []).map((t) => ({ id: t.id, nombre: t.nombre }))}
      puedeEditar={puede(sesion, "expediente.editar")}
      errorCarga={hallazgos.error ? "No se pudo cargar el odontograma. Si acabas de actualizar el sistema, aplica la última migración." : null}
    />
  );
}
