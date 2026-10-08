import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesion, puede } from "@/lib/sesion";
import { CuentaPaciente } from "./cuenta-paciente";
import type { Abono, Plan } from "./datos";

export const metadata: Metadata = { title: "Tratamientos y pagos" };

export default async function FinanzasPacientePage({ params }: PageProps<"/pacientes/[id]/finanzas">) {
  const sesion = await getSesion();
  if (!puede(sesion, "finanzas.ver") && !puede(sesion, "expediente.ver")) redirect("/");
  const { id } = await params;
  const supabase = await createClient();

  const [planes, saldos, planesPago, cuotas, abonos, cuenta] = await Promise.all([
    supabase
      .from("planes_tratamiento")
      .select("id, titulo, estado, descuento, notas, created_at, doctores(nombre), plan_items(id, tratamiento_id, descripcion, pieza, cantidad, precio_unitario, completado, orden)")
      .eq("paciente_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("v_saldo_planes").select("plan_id, total, pagado, saldo").eq("paciente_id", id),
    supabase
      .from("planes_pago")
      .select("id, plan_tratamiento_id, monto_total, prima, numero_cuotas, frecuencia, fecha_inicio, planes_tratamiento!inner(paciente_id)")
      .eq("activo", true)
      .eq("planes_tratamiento.paciente_id", id),
    supabase
      .from("v_cuotas_estado")
      .select("cuota_id, plan_pago_id, numero, fecha_vencimiento, monto, pagado, pendiente, estado_calculado")
      .eq("paciente_id", id)
      .order("numero"),
    supabase
      .from("abonos")
      .select("id, plan_tratamiento_id, cuota_id, monto, metodo, referencia, recibo_numero, pagado_at, concepto, notas, anulado, motivo_anulacion, recibido_por, por_pagar_despues")
      .eq("paciente_id", id)
      .order("pagado_at", { ascending: false }),
    supabase.from("v_estado_cuenta").select("costo_total, total_abonado, por_pagar").eq("paciente_id", id).maybeSingle(),
  ]);

  const ids = [...new Set((abonos.data ?? []).map((a) => a.recibido_por).filter((v): v is string => Boolean(v)))];
  const { data: nombres } = ids.length ? await supabase.rpc("nombres_personal", { p_ids: ids }) : { data: [] };
  const nombre = new Map((nombres ?? []).map((n) => [n.id, n.nombre]));
  const saldo = new Map((saldos.data ?? []).map((s) => [s.plan_id, s]));

  const lista: Plan[] = (planes.data ?? []).map((p) => {
    const s = saldo.get(p.id);
    const pago = (planesPago.data ?? []).find((pp) => pp.plan_tratamiento_id === p.id);
    return {
      id: p.id,
      titulo: p.titulo,
      estado: p.estado,
      descuento: Number(p.descuento),
      notas: p.notas,
      creadoAt: p.created_at,
      doctor: p.doctores?.nombre ?? null,
      partidas: [...(p.plan_items ?? [])]
        .sort((a, b) => a.orden - b.orden)
        .map((i) => ({
          id: i.id,
          tratamientoId: i.tratamiento_id,
          descripcion: i.descripcion,
          pieza: i.pieza,
          cantidad: i.cantidad,
          precio: Number(i.precio_unitario),
          completado: i.completado,
        })),
      costoTotal: Number(s?.total ?? 0),
      abonado: Number(s?.pagado ?? 0),
      porPagar: Number(s?.saldo ?? 0),
      planPago: pago
        ? {
            id: pago.id,
            montoTotal: Number(pago.monto_total),
            prima: Number(pago.prima),
            numeroCuotas: pago.numero_cuotas,
            frecuencia: pago.frecuencia,
            fechaInicio: pago.fecha_inicio,
            cuotas: (cuotas.data ?? [])
              .filter((c) => c.plan_pago_id === pago.id)
              .map((c) => ({
                id: c.cuota_id!,
                numero: c.numero!,
                vencimiento: c.fecha_vencimiento!,
                monto: Number(c.monto ?? 0),
                abonado: Number(c.pagado ?? 0),
                pendiente: Number(c.pendiente ?? 0),
                estado: c.estado_calculado ?? "pendiente",
              })),
          }
        : null,
    };
  });

  const listaAbonos: Abono[] = (abonos.data ?? []).map((a) => ({
    id: a.id,
    planId: a.plan_tratamiento_id,
    cuotaId: a.cuota_id,
    monto: Number(a.monto),
    metodo: a.metodo,
    referencia: a.referencia,
    recibo: a.recibo_numero,
    pagadoAt: a.pagado_at,
    concepto: a.concepto,
    notas: a.notas,
    anulado: a.anulado,
    motivoAnulacion: a.motivo_anulacion,
    recibidoPor: a.recibido_por ? (nombre.get(a.recibido_por) ?? null) : null,
    porPagarDespues: a.por_pagar_despues !== null ? Number(a.por_pagar_despues) : null,
  }));

  const error = [planes, saldos, planesPago, cuotas, abonos].find((r) => r.error)?.error;

  return (
    <CuentaPaciente
      pacienteId={id}
      planes={lista}
      abonos={listaAbonos}
      cuenta={{
        costoTotal: Number(cuenta.data?.costo_total ?? 0),
        abonado: Number(cuenta.data?.total_abonado ?? 0),
        porPagar: Number(cuenta.data?.por_pagar ?? 0),
      }}
      puedePlanear={puede(sesion, "expediente.editar")}
      puedeCobrar={puede(sesion, "finanzas.editar")}
      errorCarga={error ? "No se pudo cargar parte del estado de cuenta. Recarga la página." : null}
    />
  );
}
