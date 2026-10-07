import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Permiso =
  | "dashboard.ver"
  | "pacientes.ver"
  | "pacientes.editar"
  | "pacientes.eliminar"
  | "expediente.ver"
  | "expediente.editar"
  | "citas.ver"
  | "citas.editar"
  | "agenda.configurar"
  | "tratamientos.editar"
  | "finanzas.ver"
  | "finanzas.editar"
  | "usuarios.administrar"
  | "auditoria.ver";

export type Sesion = {
  userId: string;
  nombre: string;
  correo: string;
  rol: string | null;
  permisos: Permiso[];
};

// Lee la sesión una sola vez por petición. Los permisos vienen de mis_permisos():
// la interfaz los usa para ocultar lo que el rol no puede usar; RLS es la barrera real.
export const getSesion = cache(async (): Promise<Sesion> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) redirect("/login");

  const [{ data: perfil }, { data: permisos }] = await Promise.all([
    supabase.from("perfiles").select("nombre_completo, correo, roles(nombre)").eq("id", userId).maybeSingle(),
    supabase.rpc("mis_permisos"),
  ]);

  return {
    userId,
    nombre: perfil?.nombre_completo || perfil?.correo || "Usuario",
    correo: perfil?.correo ?? "",
    rol: perfil?.roles?.nombre ?? null,
    permisos: (permisos ?? []) as Permiso[],
  };
});

export function puede(sesion: Sesion, permiso: Permiso) {
  return sesion.permisos.includes(permiso);
}

/** Para páginas: sin el permiso, vuelve a la agenda (o al aviso de cuenta sin rol). */
export async function exigirPermiso(permiso: Permiso) {
  const sesion = await getSesion();
  if (!puede(sesion, permiso)) redirect("/");
  return sesion;
}
