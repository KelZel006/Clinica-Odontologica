"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigurado } from "@/lib/supabase/config";

export type EstadoLogin = { error?: string; correo?: string };

export async function iniciarSesion(_: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const correo = String(formData.get("correo") ?? "").trim();
  const contrasena = String(formData.get("contrasena") ?? "");
  const siguiente = String(formData.get("siguiente") ?? "");

  if (!correo || !contrasena) {
    return { error: "Escribe tu correo y tu contraseña.", correo };
  }

  if (!supabaseConfigurado) {
    return { error: "La app aún no está conectada a Supabase (falta la clave en .env.local).", correo };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });

  if (error) {
    const mensaje =
      error.code === "invalid_credentials"
        ? "El correo o la contraseña no coinciden. Revisa e intenta de nuevo."
        : error.code === "email_not_confirmed"
          ? "Esta cuenta aún no está confirmada. Pide al administrador que la active."
          : "No se pudo iniciar sesión. Revisa tu conexión e intenta de nuevo.";
    return { error: mensaje, correo };
  }

  // Solo rutas internas: evita redirecciones a otros sitios.
  redirect(siguiente.startsWith("/") && !siguiente.startsWith("//") ? siguiente : "/agenda");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
