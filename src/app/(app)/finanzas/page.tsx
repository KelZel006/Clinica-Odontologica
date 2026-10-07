import type { Metadata } from "next";
import Link from "next/link";
import { ReceiptTextIcon } from "lucide-react";
import { cn } from "cn";
import { Encabezado } from "@/components/encabezado";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso } from "@/lib/sesion";
import { esFechaISO, fecha, hora, hoyISO, rangoDia, sumarDias } from "@/lib/fechas";
import { lempiras } from "@/lib/lempiras";
import { ETIQUETA_METODO, METODOS } from "@/lib/finanzas";
import { FiltroPeriodo } from "./filtro-periodo";

export const metadata: Metadata = { title: "Finanzas" };

export default async function FinanzasPage({ searchParams }: PageProps<"/finanzas">) {
  await exigirPermiso("finanzas.ver");
  const hoy = hoyISO();
  const { desde: d, hasta: h } = await searchParams;
  const inicioMes = `${hoy.slice(0, 8)}01`;
  const desde = esFechaISO(d) ? d : inicioMes;
  const hasta = esFechaISO(h) && h >= desde ? h : hoy;

  const supabase = await createClient();
  const [abonos, vencidas, proximas, saldos] = await Promise.all([
    supabase
      .from("abonos")
      .select("id, monto, metodo, recibo_numero, pagado_at, concepto, paciente_id, pacientes(nombre_completo)")
      .eq("anulado", false)
      .gte("pagado_at", rangoDia(desde).desde)
      .lt("pagado_at", rangoDia(hasta).hasta)
      .order("pagado_at", { ascending: false }),
    supabase
      .from("v_cuotas_estado")
      .select("cuota_id, paciente_id, numero, fecha_vencimiento, pendiente")
      .eq("estado_calculado", "vencida")
      .order("fecha_vencimiento"),
    supabase
      .from("v_cuotas_estado")
      .select("cuota_id, paciente_id, numero, fecha_vencimiento, pendiente, estado_calculado")
      .in("estado_calculado", ["pendiente", "parcial"])
      .gte("fecha_vencimiento", hoy)
      .lte("fecha_vencimiento", sumarDias(hoy, 7))
      .order("fecha_vencimiento"),
    supabase.from("v_estado_cuenta").select("paciente_id, costo_total, total_abonado, por_pagar").gt("por_pagar", 0).order("por_pagar", { ascending: false }),
  ]);

  // Nombres de pacientes para las vistas (que no traen relaciones).
  const idsPacientes = [
    ...new Set([...(vencidas.data ?? []), ...(proximas.data ?? []), ...(saldos.data ?? [])].map((r) => r.paciente_id).filter((v): v is string => Boolean(v))),
  ];
  const { data: pacientes } = idsPacientes.length
    ? await supabase.from("pacientes").select("id, nombre_completo").in("id", idsPacientes)
    : { data: [] };
  const nombre = new Map((pacientes ?? []).map((p) => [p.id, p.nombre_completo]));

  const lista = abonos.data ?? [];
  const totalPeriodo = lista.reduce((s, a) => s + Number(a.monto), 0);
  const totalHoy = lista.filter((a) => hoyISO(new Date(a.pagado_at)) === hoy).reduce((s, a) => s + Number(a.monto), 0);
  const porMetodo = METODOS.map((m) => ({
    ...m,
    total: lista.filter((a) => a.metodo === m.valor).reduce((s, a) => s + Number(a.monto), 0),
  })).filter((m) => m.total > 0);
  const totalPorPagar = (saldos.data ?? []).reduce((s, r) => s + Number(r.por_pagar ?? 0), 0);
  const totalVencido = (vencidas.data ?? []).reduce((s, r) => s + Number(r.pendiente ?? 0), 0);
  const error = [abonos, vencidas, proximas, saldos].find((r) => r.error)?.error;

  return (
    <main className="flex-1">
      <Encabezado
        titulo="Finanzas"
        detalle={
          <span className="cifras flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Abonado hoy <span className="font-semibold text-azul">{lempiras(totalHoy)}</span>
            </span>
            <span>
              POR PAGAR total <span className="font-semibold text-rojo">{lempiras(totalPorPagar)}</span>
            </span>
            {(vencidas.data?.length ?? 0) > 0 && (
              <span className="font-semibold text-rojo">
                {vencidas.data!.length} {vencidas.data!.length === 1 ? "cuota vencida" : "cuotas vencidas"} · {lempiras(totalVencido)}
              </span>
            )}
          </span>
        }
      />

      {error && (
        <p role="alert" className="mx-4 mt-4 rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo sm:mx-6">
          No se pudo cargar parte de la información. Recarga la página.
        </p>
      )}

      <div className="grid gap-6 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <section aria-labelledby="abonos-titulo" className="min-w-0 rounded-md border border-linea bg-superficie">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-linea px-4 py-3">
            <div>
              <h2 id="abonos-titulo" className="text-base font-semibold">
                Abonos recibidos
              </h2>
              <p className="cifras mt-0.5 text-[0.8125rem] text-grafito-suave">
                {lista.length} {lista.length === 1 ? "abono" : "abonos"} · <span className="font-semibold text-azul">{lempiras(totalPeriodo)}</span>
                {porMetodo.length > 0 && ` · ${porMetodo.map((m) => `${ETIQUETA_METODO[m.valor]} ${lempiras(m.total)}`).join(" · ")}`}
              </p>
            </div>
            <FiltroPeriodo desde={desde} hasta={hasta} hoy={hoy} />
          </div>
          {lista.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-grafito-suave">No hay abonos en este periodo.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-linea text-left text-[0.75rem] text-grafito-suave">
                    <th scope="col" className="px-4 py-2 font-medium">Fecha</th>
                    <th scope="col" className="px-2 py-2 font-medium">Paciente</th>
                    <th scope="col" className="hidden px-2 py-2 font-medium md:table-cell">Concepto</th>
                    <th scope="col" className="hidden px-2 py-2 font-medium sm:table-cell">Método</th>
                    <th scope="col" className="px-2 py-2 font-medium">Recibo</th>
                    <th scope="col" className="px-4 py-2 text-right font-medium">Abonado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linea">
                  {lista.map((a) => (
                    <tr key={a.id}>
                      <td className="cifras px-4 py-2.5 whitespace-nowrap">
                        {fecha(a.pagado_at)} <span className="text-grafito-suave">{hora(a.pagado_at)}</span>
                      </td>
                      <td className="px-2 py-2.5">
                        <Link href={`/pacientes/${a.paciente_id}/finanzas`} className="font-medium hover:underline">
                          {a.pacientes?.nombre_completo}
                        </Link>
                      </td>
                      <td className="hidden px-2 py-2.5 md:table-cell">{a.concepto}</td>
                      <td className="hidden px-2 py-2.5 sm:table-cell">{ETIQUETA_METODO[a.metodo]}</td>
                      <td className="cifras px-2 py-2.5">
                        <Link href={`/recibos/${a.id}`} target="_blank" className="inline-flex items-center gap-1 underline decoration-linea-fuerte hover:decoration-grafito">
                          <ReceiptTextIcon className="size-3.5" aria-hidden />
                          {String(a.recibo_numero).padStart(6, "0")}
                        </Link>
                      </td>
                      <td className="cifras px-4 py-2.5 text-right font-semibold whitespace-nowrap text-azul">{lempiras(a.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid gap-6">
          <ListaCuotas
            titulo="Cuotas vencidas"
            vacio="No hay cuotas vencidas."
            tono="rojo"
            filas={(vencidas.data ?? []).map((c) => ({
              id: c.cuota_id!,
              pacienteId: c.paciente_id!,
              paciente: nombre.get(c.paciente_id!) ?? "Paciente",
              detalle: `Cuota ${c.numero} · venció ${fecha(c.fecha_vencimiento!)}`,
              monto: Number(c.pendiente ?? 0),
            }))}
          />
          <ListaCuotas
            titulo="Cuotas de los próximos 7 días"
            vacio="Ninguna cuota vence esta semana."
            filas={(proximas.data ?? []).map((c) => ({
              id: c.cuota_id!,
              pacienteId: c.paciente_id!,
              paciente: nombre.get(c.paciente_id!) ?? "Paciente",
              detalle: `Cuota ${c.numero} · vence ${c.fecha_vencimiento === hoy ? "hoy" : fecha(c.fecha_vencimiento!)}`,
              monto: Number(c.pendiente ?? 0),
            }))}
          />
          <ListaCuotas
            titulo="Pacientes con saldo POR PAGAR"
            vacio="Ningún paciente tiene saldo pendiente."
            filas={(saldos.data ?? []).slice(0, 25).map((s) => ({
              id: s.paciente_id!,
              pacienteId: s.paciente_id!,
              paciente: nombre.get(s.paciente_id!) ?? "Paciente",
              detalle: `Abonado ${lempiras(s.total_abonado)} de ${lempiras(s.costo_total)}`,
              monto: Number(s.por_pagar ?? 0),
            }))}
          />
        </div>
      </div>
    </main>
  );
}

function ListaCuotas({
  titulo,
  vacio,
  filas,
  tono,
}: {
  titulo: string;
  vacio: string;
  filas: { id: string; pacienteId: string; paciente: string; detalle: string; monto: number }[];
  tono?: "rojo";
}) {
  return (
    <section className="rounded-md border border-linea bg-superficie">
      <h2 className={cn("border-b border-linea px-4 py-3 text-sm font-semibold", tono === "rojo" && filas.length > 0 && "text-rojo")}>
        {titulo} <span className="cifras font-normal text-grafito-suave">({filas.length})</span>
      </h2>
      {filas.length === 0 ? (
        <p className="px-4 py-4 text-[0.8125rem] text-grafito-suave">{vacio}</p>
      ) : (
        <ul className="divide-y divide-linea">
          {filas.map((f) => (
            <li key={f.id}>
              <Link href={`/pacientes/${f.pacienteId}/finanzas`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/60">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{f.paciente}</span>
                  <span className="cifras block text-[0.75rem] text-grafito-suave">{f.detalle}</span>
                </span>
                <span className="cifras shrink-0 text-sm font-semibold text-rojo">{lempiras(f.monto)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
