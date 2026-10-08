import type { Metadata } from "next";
import Image from "next/image";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { FormularioLogin } from "./formulario";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { siguiente } = await searchParams;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="hidden flex-col justify-between bg-marino p-10 text-white lg:flex">
        <Image src="/marca-blanca.png" alt="" width={607} height={436} className="h-auto w-16" />
        <div className="max-w-md">
          <h1 className="text-4xl leading-tight font-semibold text-balance">
            La agenda, los expedientes y los pagos de la clínica, en un solo lugar.
          </h1>
          <ul className="mt-8 grid gap-3 text-[0.95rem] text-marino-texto">
            <li className="flex items-center gap-3">
              <span aria-hidden className="size-2.5 rounded-full bg-[#7aa3ea]" />
              Azul: lo que ya está confirmado o hecho.
            </li>
            <li className="flex items-center gap-3">
              <span aria-hidden className="size-2.5 rounded-full bg-[#f29494]" />
              Rojo: lo que está pendiente.
            </li>
          </ul>
        </div>
        <p className="text-sm text-marino-texto">Danlí, El Paraíso · Lun–Vie 8:00–18:00 · Sáb 8:00–13:00</p>
      </section>

      <section className="flex items-center justify-center bg-superficie px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <Image
            src="/logo-clinica.png"
            alt="Dr. Elías Chirinos, cirujano dentista e implantólogo"
            width={911}
            height={663}
            priority
            className="mx-auto h-auto w-48"
          />
          <h2 className="mt-8 text-xl font-semibold text-grafito">Iniciar sesión</h2>
          <p className="mt-1 mb-6 text-sm text-grafito-suave">Usa la cuenta que te dio el administrador.</p>
          {!supabaseConfigurado && (
            <p role="alert" className="mb-5 rounded-md bg-rojo-fondo px-3 py-2.5 text-sm leading-relaxed text-rojo">
              Falta conectar la app con Supabase. Completa <code className="font-semibold">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en <code className="font-semibold">.env.local</code> y
              reinicia el servidor.
            </p>
          )}
          <FormularioLogin siguiente={typeof siguiente === "string" ? siguiente : undefined} />
        </div>
      </section>
    </main>
  );
}
