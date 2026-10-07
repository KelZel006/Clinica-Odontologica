import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSesion } from "@/lib/sesion";
import { cerrarSesion } from "@/app/login/actions";

export const metadata: Metadata = { title: "Cuenta sin rol" };

export default async function SinAcceso() {
  const sesion = await getSesion();
  if (sesion.permisos.length > 0) redirect("/");

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-linea bg-superficie p-6 sm:p-8">
        <h1 className="text-xl font-semibold">Tu cuenta aún no tiene un rol</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-grafito-suave">
          Entraste como <span className="font-medium text-grafito">{sesion.correo || sesion.nombre}</span>, pero un
          administrador todavía no te ha asignado un rol (doctor, recepción o contabilidad). Pídeselo y vuelve a entrar.
        </p>
        <form action={cerrarSesion} className="mt-6">
          <Button type="submit" variant="outline">
            <LogOutIcon aria-hidden />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </main>
  );
}
