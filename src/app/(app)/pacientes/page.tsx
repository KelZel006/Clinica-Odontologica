import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon, SearchIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Encabezado } from "@/components/encabezado";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso, puede } from "@/lib/sesion";
import { edad, fecha } from "@/lib/fechas";
import { mostrarTelefono } from "@/lib/telefono";

export const metadata: Metadata = { title: "Pacientes" };

const POR_PAGINA = 50;

export default async function PacientesPage({ searchParams }: PageProps<"/pacientes">) {
  const sesion = await exigirPermiso("pacientes.ver");
  const { q: qParam, pagina: paginaParam } = await searchParams;
  const q = typeof qParam === "string" ? qParam.trim() : "";
  const pagina = Math.max(1, Number(paginaParam) || 1);

  const supabase = await createClient();
  let consulta = supabase
    .from("pacientes")
    .select("id, numero_expediente, nombre_completo, telefono, fecha_nacimiento, alergias, created_at", { count: "exact" })
    .eq("activo", true);

  const limpio = q.replace(/[^\p{L}\p{N}\s.'-]/gu, " ").trim();
  if (limpio) {
    const digitos = limpio.replace(/\D/g, "");
    const filtros = [`nombre_completo.ilike.%${limpio}%`];
    if (digitos.length >= 3) filtros.push(`telefono.ilike.%${digitos}%`);
    if (/^\d{1,7}$/.test(limpio)) filtros.push(`numero_expediente.eq.${limpio}`);
    consulta = consulta.or(filtros.join(","));
  }

  const { data, count, error } = await consulta
    .order("nombre_completo")
    .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);

  const pacientes = data ?? [];
  const total = count ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const enlace = (p: number) => `/pacientes?${new URLSearchParams({ ...(q ? { q } : {}), ...(p > 1 ? { pagina: String(p) } : {}) })}`;

  return (
    <main className="flex-1">
      <Encabezado
        titulo="Pacientes"
        detalle={<span className="cifras">{total === 1 ? "1 paciente" : `${total} pacientes`}{q ? ` coinciden con «${q}»` : " registrados"}</span>}
      >
        {puede(sesion, "pacientes.editar") && (
          <Link href="/pacientes/nuevo" className={buttonVariants()}>
            <PlusIcon aria-hidden />
            Nuevo paciente
          </Link>
        )}
      </Encabezado>

      <div className="px-4 py-4 sm:px-6">
        <form role="search" className="relative max-w-md">
          <label htmlFor="q" className="sr-only">
            Buscar paciente
          </label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-grafito-suave" aria-hidden />
          <Input id="q" name="q" type="search" defaultValue={q} placeholder="Nombre, teléfono o n.º de expediente" className="pl-9" />
        </form>

        {error ? (
          <p role="alert" className="mt-4 rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
            No se pudo cargar la lista de pacientes. Recarga la página.
          </p>
        ) : pacientes.length === 0 ? (
          <div className="mt-10 max-w-md">
            <p className="font-medium">{q ? `Nadie coincide con «${q}».` : "Todavía no hay pacientes registrados."}</p>
            <p className="mt-1 text-sm text-grafito-suave">
              {q
                ? "Prueba con parte del nombre o los últimos dígitos del teléfono."
                : "Se registran al agendar su primera cita o desde «Nuevo paciente»."}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto rounded-md border border-linea bg-superficie">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-linea text-left text-[0.8125rem] text-grafito-suave">
                    <th scope="col" className="w-20 px-4 py-2.5 font-medium">Exp.</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Nombre</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Teléfono</th>
                    <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">Edad</th>
                    <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">Registrado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linea">
                  {pacientes.map((p) => {
                    const años = edad(p.fecha_nacimiento);
                    return (
                      <tr key={p.id} className="group relative hover:bg-muted/60">
                        <td className="cifras px-4 py-3 text-grafito-suave">{p.numero_expediente}</td>
                        <td className="px-4 py-3">
                          <Link href={`/pacientes/${p.id}`} className="font-medium after:absolute after:inset-0 group-hover:underline">
                            {p.nombre_completo}
                          </Link>
                          {p.alergias && (
                            <span className="ml-2 rounded-sm bg-rojo-fondo px-1.5 py-0.5 text-[0.6875rem] font-semibold text-rojo">
                              Alergias
                            </span>
                          )}
                        </td>
                        <td className="cifras px-4 py-3 whitespace-nowrap">{mostrarTelefono(p.telefono)}</td>
                        <td className="cifras hidden px-4 py-3 sm:table-cell">{años !== null ? `${años} años` : "—"}</td>
                        <td className="cifras hidden px-4 py-3 text-grafito-suave lg:table-cell">{fecha(p.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {paginas > 1 && (
              <nav aria-label="Páginas" className="cifras mt-4 flex items-center gap-3 text-sm">
                {pagina > 1 && (
                  <Link href={enlace(pagina - 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Anterior
                  </Link>
                )}
                <span className="text-grafito-suave">
                  Página {pagina} de {paginas}
                </span>
                {pagina < paginas && (
                  <Link href={enlace(pagina + 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Siguiente
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
