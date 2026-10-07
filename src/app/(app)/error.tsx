"use client";

import { Button } from "@/components/ui/button";

export default function ErrorApp({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60dvh] flex-1 items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold">Algo falló al cargar esta pantalla</h1>
        <p className="mt-2 text-sm text-grafito-suave">
          Revisa tu conexión a internet e intenta de nuevo. Si sigue pasando, avisa al administrador.
        </p>
        <Button variant="outline" className="mt-6" onClick={reset}>
          Intentar de nuevo
        </Button>
      </div>
    </main>
  );
}
