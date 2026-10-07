import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesion, puede } from "@/lib/sesion";
import { capitalizar, diaLargo, fecha, hora, hoyISO } from "@/lib/fechas";
import { lempiras, montoEnLetras } from "@/lib/lempiras";
import { ETIQUETA_METODO, uuidValido } from "@/lib/finanzas";
import { mostrarTelefono } from "@/lib/telefono";
import { BotonImprimir } from "./boton-imprimir";

export const metadata: Metadata = { title: "Recibo" };

export default async function ReciboPage({ params }: PageProps<"/recibos/[id]">) {
  const sesion = await getSesion();
  if (!puede(sesion, "finanzas.ver")) redirect("/");
  const { id } = await params;
  if (!uuidValido(id)) notFound();

  const supabase = await createClient();
  const { data: a } = await supabase
    .from("abonos")
    .select(
      "id, monto, metodo, referencia, recibo_numero, pagado_at, concepto, notas, anulado, motivo_anulacion, recibido_por, plan_tratamiento_id, cuota_id, pacientes(nombre_completo, numero_expediente, telefono, identidad), planes_tratamiento(titulo), cuotas(numero)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!a) notFound();

  const [{ data: saldo }, { data: nombres }] = await Promise.all([
    a.plan_tratamiento_id
      ? supabase.from("v_saldo_planes").select("total, pagado, saldo").eq("plan_id", a.plan_tratamiento_id).maybeSingle()
      : Promise.resolve({ data: null }),
    a.recibido_por ? supabase.rpc("nombres_personal", { p_ids: [a.recibido_por] }) : Promise.resolve({ data: [] }),
  ]);
  const recibidoPor = nombres?.[0]?.nombre ?? null;
  const numero = String(a.recibo_numero).padStart(6, "0");
  const dia = hoyISO(new Date(a.pagado_at));

  return (
    <main className="min-h-dvh bg-papel px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[44rem] justify-end gap-2 print:hidden">
        <BotonImprimir />
      </div>

      <article className="relative mx-auto max-w-[44rem] overflow-hidden rounded-md border border-linea bg-superficie p-8 sm:p-10 print:max-w-none print:border-0 print:p-0">
        {a.anulado && (
          <div className="mb-6 rounded-md border border-rojo bg-rojo-fondo px-4 py-3 text-sm font-semibold text-rojo">
            RECIBO ANULADO{a.motivo_anulacion ? `: ${a.motivo_anulacion}` : ""}
          </div>
        )}

        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-linea pb-6">
          <div className="flex items-center gap-4">
            <Image src="/logo-clinica.png" alt="Dr. Elías Chirinos" width={911} height={663} className="h-auto w-28" priority />
            <div>
              <p className="text-base font-semibold text-marino">Dr. Elías Renato Chirinos</p>
              <p className="text-[0.8125rem] text-grafito-suave">Cirujano dentista e implantólogo</p>
              <p className="text-[0.8125rem] text-grafito-suave">Tegucigalpa, Honduras</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[0.8125rem] font-semibold text-grafito-suave">RECIBO DE ABONO</p>
            <p className="cifras text-2xl font-semibold text-marino">N.º {numero}</p>
            <p className="cifras mt-1 text-[0.8125rem] text-grafito-suave">
              {capitalizar(diaLargo(dia))}, {fecha(a.pagado_at)}
              <br />
              {hora(a.pagado_at)}
            </p>
          </div>
        </header>

        <section className="grid gap-x-6 gap-y-2 border-b border-linea py-6 text-sm sm:grid-cols-[9rem_1fr]">
          <span className="text-grafito-suave">Recibimos de</span>
          <span className="font-semibold">{a.pacientes?.nombre_completo}</span>
          <span className="text-grafito-suave">Expediente</span>
          <span className="cifras">
            N.º {a.pacientes?.numero_expediente}
            {a.pacientes?.telefono && ` · ${mostrarTelefono(a.pacientes.telefono)}`}
            {a.pacientes?.identidad && ` · DNI ${a.pacientes.identidad}`}
          </span>
          <span className="text-grafito-suave">La cantidad de</span>
          <span className={a.anulado ? "line-through" : undefined}>{montoEnLetras(Number(a.monto))}</span>
          <span className="text-grafito-suave">Concepto</span>
          <span>
            {a.concepto === "Cuota" && a.cuotas?.numero ? `Cuota ${a.cuotas.numero}` : a.concepto}
            {a.concepto !== "Cuota" && a.cuotas?.numero ? ` · cuota ${a.cuotas.numero}` : ""}
            {a.planes_tratamiento?.titulo ? ` · ${a.planes_tratamiento.titulo}` : ""}
          </span>
          <span className="text-grafito-suave">Método de pago</span>
          <span>
            {ETIQUETA_METODO[a.metodo]}
            {a.referencia && <span className="cifras"> · Ref. {a.referencia}</span>}
          </span>
          {a.notas && (
            <>
              <span className="text-grafito-suave">Observaciones</span>
              <span>{a.notas}</span>
            </>
          )}
        </section>

        <section className="grid gap-6 py-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="rounded-md bg-azul-fondo px-5 py-4">
            <p className="text-[0.8125rem] font-semibold text-azul">ABONADO EN ESTE RECIBO</p>
            <p className={`cifras text-3xl font-semibold text-marino ${a.anulado ? "line-through" : ""}`}>{lempiras(a.monto)}</p>
          </div>
          {saldo && (
            <dl className="cifras grid grid-cols-[auto_auto] gap-x-6 gap-y-1 text-sm">
              <dt className="text-grafito-suave">Costo del tratamiento</dt>
              <dd className="text-right">{lempiras(saldo.total)}</dd>
              <dt className="text-grafito-suave">Total abonado</dt>
              <dd className="text-right text-azul">{lempiras(saldo.pagado)}</dd>
              <dt className="font-semibold">POR PAGAR</dt>
              <dd className="text-right font-semibold text-rojo">{lempiras(saldo.saldo)}</dd>
            </dl>
          )}
        </section>

        <footer className="grid gap-8 border-t border-linea pt-10 text-[0.8125rem] sm:grid-cols-2">
          <div>
            <div className="border-t border-grafito-suave pt-1.5 text-center text-grafito-suave">Recibido por{recibidoPor ? `: ${recibidoPor}` : ""}</div>
          </div>
          <div>
            <div className="border-t border-grafito-suave pt-1.5 text-center text-grafito-suave">Firma del paciente</div>
          </div>
        </footer>
        <p className="mt-8 text-center text-[0.75rem] text-grafito-suave">
          Saldos a la fecha y hora de emisión de este recibo. Montos en Lempiras (HNL).
        </p>
      </article>
    </main>
  );
}
