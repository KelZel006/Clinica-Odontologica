"use client";

import { useActionState } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Campo } from "@/components/campo";
import { iniciarSesion, type EstadoLogin } from "./actions";

export function FormularioLogin({ siguiente }: { siguiente?: string }) {
  const [estado, accion, enviando] = useActionState<EstadoLogin, FormData>(iniciarSesion, {});

  return (
    <form action={accion} className="grid gap-4" noValidate>
      <input type="hidden" name="siguiente" value={siguiente ?? ""} />
      <Campo id="correo" etiqueta="Correo">
        <Input
          id="correo"
          name="correo"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          defaultValue={estado.correo}
          aria-invalid={Boolean(estado.error) || undefined}
          autoFocus
        />
      </Campo>
      <Campo id="contrasena" etiqueta="Contraseña">
        <Input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(estado.error) || undefined}
        />
      </Campo>
      {estado.error && (
        <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
          {estado.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={enviando} className="mt-1 w-full">
        {enviando && <LoaderCircleIcon className="animate-spin" aria-hidden />}
        {enviando ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
