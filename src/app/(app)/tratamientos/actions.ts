"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesion, puede } from "@/lib/sesion";
import { leerMonto } from "@/lib/lempiras";

export type EstadoTratamiento = {
  error?: string;
  errores?: Partial<Record<"nombre" | "precio" | "duracion" | "orden", string>>;
  valores?: Record<string, string>;
};

const CAMPOS = [
  "id",
  "nombre",
  "categoria",
  "descripcion",
  "precio",
  "duracion",
  "orden",
  "indicaciones",
  "contraindicaciones",
  "cuidados_posteriores",
] as const;

function slug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function guardarTratamiento(_: EstadoTratamiento, formData: FormData): Promise<EstadoTratamiento> {
  const sesion = await getSesion();
  if (!puede(sesion, "tratamientos.editar")) return { error: "Solo administración puede editar el catálogo." };

  const v = Object.fromEntries(CAMPOS.map((k) => [k, String(formData.get(k) ?? "").trim()])) as Record<(typeof CAMPOS)[number], string>;
  const visibleWeb = formData.get("visible_web") === "on";
  const activo = formData.get("activo") === "on";

  const errores: EstadoTratamiento["errores"] = {};
  if (!v.nombre) errores.nombre = "Escribe el nombre del tratamiento.";
  const precio = v.precio ? leerMonto(v.precio) : null;
  if (v.precio && (precio === null || precio < 0)) errores.precio = "Escribe un monto válido, por ejemplo 1500.00.";
  const duracion = Number(v.duracion);
  if (!Number.isInteger(duracion) || duracion < 5 || duracion > 600) errores.duracion = "Entre 5 y 600 minutos.";
  const orden = v.orden ? Number(v.orden) : 0;
  if (!Number.isInteger(orden)) errores.orden = "Debe ser un número entero.";
  if (Object.keys(errores).length) return { errores, valores: { ...v, visible_web: visibleWeb ? "on" : "", activo: activo ? "on" : "" } };

  const fila = {
    nombre: v.nombre,
    categoria: v.categoria || null,
    descripcion: v.descripcion || null,
    precio_referencia: precio,
    duracion_minutos: duracion,
    orden,
    visible_web: visibleWeb,
    activo,
    indicaciones: v.indicaciones || null,
    contraindicaciones: v.contraindicaciones || null,
    cuidados_posteriores: v.cuidados_posteriores || null,
  };

  const supabase = await createClient();
  const { error } = v.id
    ? await supabase.from("tratamientos").update(fila).eq("id", v.id)
    : await supabase.from("tratamientos").insert({ ...fila, slug: `${slug(v.nombre)}-${Date.now().toString(36).slice(-4)}` });

  if (error) {
    if (error.code === "23505") return { errores: { nombre: "Ya existe un tratamiento con ese nombre." }, valores: v };
    return { error: "No se pudo guardar. Revisa tu conexión e intenta de nuevo.", valores: v };
  }

  revalidatePath("/tratamientos");
  redirect("/tratamientos");
}
