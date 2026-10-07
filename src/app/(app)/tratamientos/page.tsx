import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Encabezado } from "@/components/encabezado";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso } from "@/lib/sesion";
import { lempiras } from "@/lib/lempiras";

export const metadata: Metadata = { title: "Tratamientos" };

export default async function TratamientosPage() {
  await exigirPermiso("tratamientos.editar");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tratamientos")
    .select("id, nombre, categoria, precio_referencia, duracion_minutos, visible_web, reservable_web, activo")
    .order("activo", { ascending: false })
    .order("orden")
    .order("nombre");

  const lista = data ?? [];
  const activos = lista.filter((t) => t.activo).length;

  return (
    <main className="flex-1">
      <Encabezado
        titulo="Catálogo de tratamientos"
        detalle={
          <span className="cifras">
            {activos} activos · los precios son de referencia; el precio final se ajusta en cada plan de tratamiento
          </span>
        }
      >
        <Link href="/tratamientos/nuevo" className={buttonVariants()}>
          <PlusIcon aria-hidden />
          Nuevo tratamiento
        </Link>
      </Encabezado>

      <div className="px-4 py-5 sm:px-6">
        {error ? (
          <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
            No se pudo cargar el catálogo. Recarga la página.
          </p>
        ) : lista.length === 0 ? (
          <p className="text-sm text-grafito-suave">Todavía no hay tratamientos en el catálogo.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-linea bg-superficie">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-linea text-left text-[0.8125rem] text-grafito-suave">
                  <th scope="col" className="px-4 py-2.5 font-medium">Tratamiento</th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Categoría</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Precio de referencia</th>
                  <th scope="col" className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">Duración</th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">En la web</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linea">
                {lista.map((t) => (
                  <tr key={t.id} className={cn("group relative hover:bg-muted/60", !t.activo && "text-grafito-suave")}>
                    <td className="px-4 py-3">
                      <Link href={`/tratamientos/${t.id}`} className="font-medium after:absolute after:inset-0 group-hover:underline">
                        {t.nombre}
                      </Link>
                      {!t.activo && <span className="ml-2 text-[0.75rem]">(inactivo)</span>}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">{t.categoria ?? "—"}</td>
                    <td className="cifras px-4 py-3 text-right whitespace-nowrap">
                      {t.precio_referencia !== null ? lempiras(t.precio_referencia) : <span className="text-grafito-suave">Sin precio</span>}
                    </td>
                    <td className="cifras hidden px-4 py-3 text-right sm:table-cell">{t.duracion_minutos} min</td>
                    <td className="hidden px-4 py-3 lg:table-cell">{t.reservable_web ? "Se reserva en línea" : t.visible_web ? "Visible" : "Oculto"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
