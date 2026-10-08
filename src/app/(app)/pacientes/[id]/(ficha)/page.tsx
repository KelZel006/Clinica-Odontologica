import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TriangleAlertIcon } from "lucide-react";
import { cn } from "cn";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso, puede } from "@/lib/sesion";
import { capitalizar, diaCorto, fecha, hora, hoyISO } from "@/lib/fechas";
import { mostrarTelefono } from "@/lib/telefono";
import { mostrarDNI } from "@/lib/dni";
import { ESTADOS } from "../../../agenda/tipos";

export const metadata: Metadata = { title: "Ficha del paciente" };

const SEXO: Record<string, string> = { F: "Femenino", M: "Masculino", otro: "Otro" };

export default async function PacientePage({ params }: PageProps<"/pacientes/[id]">) {
  const sesion = await exigirPermiso("pacientes.ver");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const verCitas = puede(sesion, "citas.ver");
  const [{ data: p }, citas] = await Promise.all([
    supabase.from("pacientes").select("*").eq("id", id).maybeSingle(),
    verCitas
      ? supabase
          .from("citas")
          .select("id, inicio, fin, estado, tratamientos(nombre)")
          .eq("paciente_id", id)
          .order("inicio", { ascending: false })
          .limit(30)
      : Promise.resolve({ data: null }),
  ]);
  if (!p) notFound();

  const { proximas, historial } = separarCitas(citas.data ?? []);

  return (
    <>

      <div className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid content-start gap-6">
          {p.alergias && (
            <div role="note" className="flex gap-3 rounded-md border border-rojo/40 bg-rojo-fondo px-4 py-3 text-rojo">
              <TriangleAlertIcon className="mt-0.5 size-5 shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-semibold">Alergias</p>
                <p className="mt-0.5 text-sm whitespace-pre-line">{p.alergias}</p>
              </div>
            </div>
          )}

          <Bloque titulo="Datos generales" lista>
            <Fila etiqueta="Fecha de nacimiento" valor={p.fecha_nacimiento ? fecha(p.fecha_nacimiento) : null} />
            <Fila etiqueta="Sexo" valor={p.sexo ? SEXO[p.sexo] : null} />
            <Fila etiqueta="DNI" valor={p.identidad && mostrarDNI(p.identidad)} cifras />
            <Fila etiqueta="Correo" valor={p.correo} />
            <Fila etiqueta="Ocupación" valor={p.ocupacion} />
            <Fila etiqueta="Dirección" valor={p.direccion} />
            <Fila
              etiqueta="Emergencia"
              valor={
                p.contacto_emergencia || p.telefono_emergencia
                  ? [p.contacto_emergencia, p.telefono_emergencia && mostrarTelefono(p.telefono_emergencia)].filter(Boolean).join(" · ")
                  : null
              }
            />
          </Bloque>

          <Bloque titulo="Salud" lista>
            <Fila etiqueta="Antecedentes" valor={p.antecedentes_medicos} />
            <Fila etiqueta="Medicamentos" valor={p.medicamentos_actuales} />
            {!p.alergias && <Fila etiqueta="Alergias" valor="Ninguna registrada" />}
          </Bloque>

          {p.notas && (
            <Bloque titulo="Notas internas">
              <p className="px-4 py-3 text-sm whitespace-pre-line">{p.notas}</p>
            </Bloque>
          )}
        </div>

        {verCitas && (
          <aside className="grid content-start gap-6">
            <Bloque titulo="Próximas citas">
              {proximas.length === 0 ? (
                <p className="px-4 py-3 text-sm text-grafito-suave">No tiene citas programadas.</p>
              ) : (
                <ListaCitas citas={proximas} />
              )}
            </Bloque>
            {historial.length > 0 && (
              <Bloque titulo="Historial de citas">
                <ListaCitas citas={historial} />
              </Bloque>
            )}
          </aside>
        )}
      </div>
    </>
  );
}

/** Próximas = activas que aún no terminan (de la más cercana a la más lejana); el resto es historial. */
function separarCitas<T extends { fin: string; estado: string }>(lista: T[]) {
  const ahora = Date.now();
  const proximas = lista
    .filter((c) => Date.parse(c.fin) >= ahora && (c.estado === "pendiente" || c.estado === "confirmada"))
    .reverse();
  return { proximas, historial: lista.filter((c) => !proximas.includes(c)) };
}

function Bloque({ titulo, lista, children }: { titulo: string; lista?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-linea bg-superficie">
      <h2 className="border-b border-linea px-4 py-2.5 text-[0.8125rem] font-semibold">{titulo}</h2>
      {lista ? <dl>{children}</dl> : children}
    </section>
  );
}

function Fila({ etiqueta, valor, cifras }: { etiqueta: string; valor: string | null; cifras?: boolean }) {
  return (
    <div className="grid gap-1 border-b border-linea px-4 py-2.5 text-sm last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-3">
      <dt className="text-grafito-suave">{etiqueta}</dt>
      <dd className={cn("whitespace-pre-line", cifras && "cifras", !valor && "text-grafito-suave")}>{valor || "—"}</dd>
    </div>
  );
}

type CitaFila = { id: string; inicio: string; estado: keyof typeof ESTADOS; tratamientos: { nombre: string } | null };

function ListaCitas({ citas }: { citas: CitaFila[] }) {
  return (
    <ul className="divide-y divide-linea">
      {citas.map((c) => {
        const { etiqueta, tinta } = ESTADOS[c.estado];
        const dia = hoyISO(new Date(c.inicio));
        return (
          <li key={c.id}>
            <Link
              href={`/agenda?fecha=${dia}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/60"
            >
              <span className="min-w-0">
                <span className="cifras block font-medium">
                  {capitalizar(diaCorto(dia))} · {hora(c.inicio)}
                </span>
                <span className="block truncate text-[0.8125rem] text-grafito-suave">
                  {c.tratamientos?.nombre ?? "Sin tratamiento indicado"}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 text-[0.75rem] font-semibold",
                  tinta === "roja" && "text-rojo",
                  (tinta === "azul" || tinta === "azul-solida") && "text-azul",
                  tinta === "apagada" && "font-medium text-grafito-suave",
                )}
              >
                {etiqueta}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
