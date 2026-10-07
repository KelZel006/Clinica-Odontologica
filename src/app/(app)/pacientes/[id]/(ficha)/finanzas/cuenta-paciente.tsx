"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PencilIcon, PlusIcon, ReceiptTextIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fecha } from "@/lib/fechas";
import { lempiras } from "@/lib/lempiras";
import { ETIQUETA_CUOTA, ETIQUETA_FRECUENCIA, ETIQUETA_METODO, ETIQUETA_PLAN, type EstadoPlan } from "@/lib/finanzas";
import { anularAbono, cambiarEstadoPlan, cancelarPlanPago, marcarPartida } from "./actions";
import type { Abono, Plan } from "./datos";
import { DialogoAbono } from "./dialogo-abono";
import { FormularioPlanPago } from "./formulario-plan-pago";

type Props = {
  pacienteId: string;
  planes: Plan[];
  abonos: Abono[];
  cuenta: { costoTotal: number; abonado: number; porPagar: number };
  puedePlanear: boolean;
  puedeCobrar: boolean;
  errorCarga: string | null;
};

export function CuentaPaciente({ pacienteId, planes, abonos, cuenta, puedePlanear, puedeCobrar, errorCarga }: Props) {
  const [abonoPara, setAbonoPara] = useState<{ planId: string | null } | null>(null);
  const sueltos = abonos.filter((a) => !a.planId);

  return (
    <div className="grid max-w-5xl grid-cols-1 gap-6 px-4 py-5 sm:px-6 [&>*]:min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ResumenCuenta {...cuenta} titulo="Estado de cuenta del paciente" />
        <div className="flex flex-wrap gap-2">
          {puedeCobrar && (
            <Button
              onClick={() => {
                const conSaldo = planes.filter((p) => p.porPagar > 0 && p.estado !== "rechazado");
                const preferido = conSaldo.find((p) => p.estado === "en_curso" || p.estado === "aceptado") ?? conSaldo[0];
                setAbonoPara({ planId: preferido?.id ?? null });
              }}
            >
              <PlusIcon aria-hidden />
              Registrar abono
            </Button>
          )}
          {puedePlanear && (
            <Link href={`/pacientes/${pacienteId}/finanzas/plan`} className={buttonVariants({ variant: puedeCobrar ? "outline" : "default" })}>
              <PlusIcon aria-hidden />
              Nuevo plan de tratamiento
            </Link>
          )}
        </div>
      </div>

      {errorCarga && (
        <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
          {errorCarga}
        </p>
      )}

      {planes.length === 0 ? (
        <div className="rounded-md border border-dashed border-linea-fuerte px-5 py-8 text-center">
          <p className="font-medium">Este paciente aún no tiene planes de tratamiento.</p>
          <p className="mt-1 text-sm text-grafito-suave">
            {puedePlanear
              ? "Crea uno con las partidas del tratamiento; puedes tomarlas de lo planificado en el odontograma."
              : "El doctor arma el plan de tratamiento; aquí aparecerá con su costo, abonos y lo que queda POR PAGAR."}
          </p>
        </div>
      ) : (
        planes.map((plan) => (
          <SeccionPlan
            key={plan.id}
            pacienteId={pacienteId}
            plan={plan}
            abonos={abonos.filter((a) => a.planId === plan.id)}
            puedePlanear={puedePlanear}
            puedeCobrar={puedeCobrar}
            onAbonar={() => setAbonoPara({ planId: plan.id })}
          />
        ))
      )}

      {sueltos.length > 0 && (
        <section className="rounded-md border border-linea bg-superficie">
          <h2 className="border-b border-linea px-4 py-3 text-sm font-semibold">Abonos sin plan de tratamiento</h2>
          <TablaAbonos pacienteId={pacienteId} abonos={sueltos} puedeCobrar={puedeCobrar} />
        </section>
      )}

      {puedeCobrar && (
        <DialogoAbono
          key={abonoPara?.planId ?? "cerrado"}
          abierto={abonoPara !== null}
          onCerrar={() => setAbonoPara(null)}
          pacienteId={pacienteId}
          planes={planes.filter((p) => p.estado !== "rechazado")}
          abonos={abonos}
          planInicial={abonoPara?.planId ?? null}
        />
      )}
    </div>
  );
}

/** Costo total − total abonado = POR PAGAR. Los montos vienen calculados por la base de datos. */
function ResumenCuenta({ costoTotal, abonado, porPagar, titulo }: { costoTotal: number; abonado: number; porPagar: number; titulo: string }) {
  return (
    <dl aria-label={titulo} className="grid grid-cols-3 divide-x divide-linea overflow-hidden rounded-md border border-linea bg-superficie">
      <div className="px-4 py-2.5">
        <dt className="text-[0.75rem] text-grafito-suave">Costo total</dt>
        <dd className="cifras text-base font-semibold">{lempiras(costoTotal)}</dd>
      </div>
      <div className="px-4 py-2.5">
        <dt className="text-[0.75rem] text-grafito-suave">ABONADO</dt>
        <dd className="cifras text-base font-semibold text-azul">{lempiras(abonado)}</dd>
      </div>
      <div className="px-4 py-2.5">
        <dt className="text-[0.75rem] text-grafito-suave">POR PAGAR</dt>
        <dd className={cn("cifras text-base font-semibold", porPagar > 0 ? "text-rojo" : "text-grafito")}>{lempiras(porPagar)}</dd>
      </div>
    </dl>
  );
}

const SIGUIENTE: Partial<Record<EstadoPlan, { a: EstadoPlan; etiqueta: string }[]>> = {
  propuesto: [
    { a: "aceptado", etiqueta: "El paciente aceptó" },
    { a: "rechazado", etiqueta: "No aceptó" },
  ],
  aceptado: [{ a: "en_curso", etiqueta: "Iniciar tratamiento" }],
  en_curso: [{ a: "finalizado", etiqueta: "Finalizar tratamiento" }],
  finalizado: [{ a: "en_curso", etiqueta: "Reabrir" }],
  rechazado: [{ a: "propuesto", etiqueta: "Volver a proponer" }],
};

function SeccionPlan({
  pacienteId,
  plan,
  abonos,
  puedePlanear,
  puedeCobrar,
  onAbonar,
}: {
  pacienteId: string;
  plan: Plan;
  abonos: Abono[];
  puedePlanear: boolean;
  puedeCobrar: boolean;
  onAbonar: () => void;
}) {
  const [pendiente, iniciar] = useTransition();
  const [nuevoPlanPago, setNuevoPlanPago] = useState(false);
  const subtotal = plan.partidas.reduce((s, p) => s + p.cantidad * p.precio, 0);
  const rechazado = plan.estado === "rechazado";

  const ejecutar = (accion: () => Promise<{ ok: boolean; mensaje?: string; error?: string }>) =>
    iniciar(async () => {
      const r = await accion();
      if (!r.ok) toast.error(r.error);
      else if (r.mensaje) toast.success(r.mensaje);
    });

  return (
    <section aria-labelledby={`plan-${plan.id}`} className={cn("min-w-0 rounded-md border border-linea bg-superficie", rechazado && "opacity-75")}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-linea px-4 py-3">
        <div className="min-w-0">
          <h2 id={`plan-${plan.id}`} className="text-base font-semibold">
            {plan.titulo}
          </h2>
          <p className="mt-0.5 text-[0.8125rem] text-grafito-suave">
            <span className={cn("font-medium", plan.estado === "propuesto" ? "text-rojo" : rechazado ? "text-grafito-suave" : "text-azul")}>
              {ETIQUETA_PLAN[plan.estado]}
            </span>
            {" · "}
            {fecha(plan.creadoAt)}
            {plan.doctor && ` · ${plan.doctor}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {puedeCobrar && !rechazado && plan.porPagar > 0 && (
            <Button size="sm" onClick={onAbonar} disabled={pendiente}>
              Registrar abono
            </Button>
          )}
          {puedePlanear &&
            SIGUIENTE[plan.estado]?.map((s) => (
              <Button
                key={s.a}
                size="sm"
                variant={s.a === "rechazado" ? "ghost" : "outline"}
                disabled={pendiente}
                onClick={() => ejecutar(() => cambiarEstadoPlan(pacienteId, plan.id, plan.estado, s.a))}
              >
                {s.etiqueta}
              </Button>
            ))}
          {puedePlanear && plan.estado === "propuesto" && (
            <Link href={`/pacientes/${pacienteId}/finanzas/plan?editar=${plan.id}`} className={buttonVariants({ size: "sm", variant: "ghost" })}>
              <PencilIcon aria-hidden />
              Editar
            </Link>
          )}
        </div>
      </header>

      {/* Partidas */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-linea text-left text-[0.75rem] text-grafito-suave">
              <th scope="col" className="w-10 px-4 py-2 font-medium">
                <span className="sr-only">Hecho</span>
              </th>
              <th scope="col" className="px-2 py-2 font-medium">Partida</th>
              <th scope="col" className="px-2 py-2 font-medium">Pieza</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">Cant.</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">Precio</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-linea">
            {plan.partidas.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={p.completado}
                    disabled={!puedePlanear || pendiente || rechazado}
                    onChange={(e) => ejecutar(() => marcarPartida(pacienteId, p.id, e.target.checked))}
                    aria-label={`${p.descripcion}: ${p.completado ? "realizado" : "pendiente"}`}
                    className="size-4.5 accent-[var(--tinta-azul)]"
                  />
                </td>
                <td className={cn("px-2 py-2", p.completado && "text-grafito-suave")}>{p.descripcion}</td>
                <td className="cifras px-2 py-2">{p.pieza ?? "—"}</td>
                <td className="cifras px-2 py-2 text-right">{p.cantidad}</td>
                <td className="cifras px-2 py-2 text-right whitespace-nowrap">{lempiras(p.precio)}</td>
                <td className="cifras px-4 py-2 text-right whitespace-nowrap">{lempiras(p.cantidad * p.precio)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="text-[0.8125rem]">
            {plan.descuento > 0 && (
              <>
                <tr className="border-t border-linea">
                  <td colSpan={5} className="px-4 py-1.5 text-right text-grafito-suave">Subtotal</td>
                  <td className="cifras px-4 py-1.5 text-right">{lempiras(subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-4 py-1.5 text-right text-grafito-suave">Descuento</td>
                  <td className="cifras px-4 py-1.5 text-right">− {lempiras(plan.descuento)}</td>
                </tr>
              </>
            )}
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-linea px-4 py-4 [&>*]:min-w-0">
        <ResumenCuenta costoTotal={plan.costoTotal} abonado={plan.abonado} porPagar={plan.porPagar} titulo={`Resumen financiero de ${plan.titulo}`} />
        {plan.notas && <p className="text-[0.8125rem] whitespace-pre-line text-grafito-suave">{plan.notas}</p>}

        {/* Plan de pago */}
        {plan.planPago ? (
          <div>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">
                Plan de pago{" "}
                <span className="cifras font-normal text-grafito-suave">
                  · {lempiras(plan.planPago.montoTotal)} · enganche {lempiras(plan.planPago.prima)} · {plan.planPago.numeroCuotas}{" "}
                  {plan.planPago.numeroCuotas === 1
                    ? `cuota ${ETIQUETA_FRECUENCIA[plan.planPago.frecuencia].toLowerCase()}`
                    : `cuotas ${ETIQUETA_FRECUENCIA[plan.planPago.frecuencia].toLowerCase()}es`}
                </span>
              </h3>
              {puedeCobrar && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-grafito-suave"
                  disabled={pendiente}
                  onClick={() => {
                    if (window.confirm("¿Cancelar este plan de pago? Las cuotas sin abonos quedan anuladas; los abonos se conservan.")) {
                      ejecutar(() => cancelarPlanPago(pacienteId, plan.planPago!.id));
                    }
                  }}
                >
                  Cancelar plan de pago
                </Button>
              )}
            </div>
            <div className="relative overflow-x-auto rounded-md border border-linea">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-linea text-left text-[0.75rem] text-grafito-suave">
                    <th scope="col" className="px-3 py-2 font-medium">Cuota</th>
                    <th scope="col" className="px-3 py-2 font-medium">Vence</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Monto</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Abonado</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Por pagar</th>
                    <th scope="col" className="px-3 py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linea">
                  {plan.planPago.cuotas.map((c) => {
                    const meta = ETIQUETA_CUOTA[c.estado] ?? ETIQUETA_CUOTA.pendiente;
                    return (
                      <tr key={c.id} className={cn(meta.tinta === "apagada" && "text-grafito-suave line-through")}>
                        <td className="cifras px-3 py-2">{c.numero}</td>
                        <td className="cifras px-3 py-2 whitespace-nowrap">{fecha(c.vencimiento)}</td>
                        <td className="cifras px-3 py-2 text-right whitespace-nowrap">{lempiras(c.monto)}</td>
                        <td className="cifras px-3 py-2 text-right whitespace-nowrap text-azul">{c.abonado > 0 ? lempiras(c.abonado) : "—"}</td>
                        <td className="cifras px-3 py-2 text-right whitespace-nowrap">{c.pendiente > 0 ? lempiras(c.pendiente) : "—"}</td>
                        <td
                          className={cn(
                            "px-3 py-2 text-[0.8125rem] font-medium whitespace-nowrap",
                            meta.tinta === "azul" && "text-azul",
                            meta.tinta === "roja" && "text-rojo",
                            c.estado === "vencida" && "font-semibold",
                          )}
                        >
                          {meta.etiqueta}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          puedeCobrar &&
          !rechazado &&
          plan.porPagar > 0 &&
          (nuevoPlanPago ? (
            <FormularioPlanPago pacienteId={pacienteId} planId={plan.id} porPagar={plan.porPagar} onCerrar={() => setNuevoPlanPago(false)} />
          ) : (
            <div>
              <Button size="sm" variant="outline" onClick={() => setNuevoPlanPago(true)}>
                Crear plan de pago
              </Button>
              <span className="ml-3 text-[0.8125rem] text-grafito-suave">Enganche y cuotas semanales, quincenales o mensuales.</span>
            </div>
          ))
        )}

        {/* Historial de abonos del plan */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">
            Historial de abonos <span className="cifras font-normal text-grafito-suave">({abonos.filter((a) => !a.anulado).length})</span>
          </h3>
          {abonos.length === 0 ? (
            <p className="text-[0.8125rem] text-grafito-suave">Todavía no hay abonos a este plan.</p>
          ) : (
            <div className="overflow-hidden rounded-md border border-linea">
              <TablaAbonos pacienteId={pacienteId} abonos={abonos} puedeCobrar={puedeCobrar} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TablaAbonos({ pacienteId, abonos, puedeCobrar }: { pacienteId: string; abonos: Abono[]; puedeCobrar: boolean }) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-linea text-left text-[0.75rem] text-grafito-suave">
            <th scope="col" className="px-3 py-2 font-medium">Fecha</th>
            <th scope="col" className="px-3 py-2 font-medium">Concepto</th>
            <th scope="col" className="px-3 py-2 font-medium">Método</th>
            <th scope="col" className="px-3 py-2 font-medium">Recibo</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Abonado</th>
            <th scope="col" className="px-3 py-2">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-linea">
          {abonos.map((a) => (
            <FilaAbono key={a.id} pacienteId={pacienteId} abono={a} puedeCobrar={puedeCobrar} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilaAbono({ pacienteId, abono: a, puedeCobrar }: { pacienteId: string; abono: Abono; puedeCobrar: boolean }) {
  const [anulando, setAnulando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [pendiente, iniciar] = useTransition();

  const anular = () =>
    iniciar(async () => {
      const r = await anularAbono(pacienteId, a.id, motivo);
      if (r.ok) {
        toast.success(r.mensaje);
        setAnulando(false);
      } else toast.error(r.error);
    });

  return (
    <>
      <tr className={cn(a.anulado && "text-grafito-suave")}>
        <td className="cifras px-3 py-2 whitespace-nowrap">{fecha(a.pagadoAt)}</td>
        <td className={cn("px-3 py-2", a.anulado && "line-through")}>
          {a.concepto}
          {a.anulado && <span className="block text-[0.75rem] no-underline">Anulado: {a.motivoAnulacion}</span>}
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
          {ETIQUETA_METODO[a.metodo]}
          {a.referencia && <span className="cifras block text-[0.75rem] text-grafito-suave">Ref. {a.referencia}</span>}
        </td>
        <td className="cifras px-3 py-2">
          <Link href={`/recibos/${a.id}`} target="_blank" className="inline-flex items-center gap-1 underline decoration-linea-fuerte hover:decoration-grafito">
            <ReceiptTextIcon className="size-3.5" aria-hidden />
            {String(a.recibo).padStart(6, "0")}
          </Link>
        </td>
        <td className={cn("cifras px-3 py-2 text-right font-semibold whitespace-nowrap", a.anulado ? "line-through" : "text-azul")}>{lempiras(a.monto)}</td>
        <td className="px-3 py-2 text-right">
          {puedeCobrar && !a.anulado && !anulando && (
            <Button size="sm" variant="ghost" className="text-grafito-suave" onClick={() => setAnulando(true)}>
              Anular
            </Button>
          )}
        </td>
      </tr>
      {anulando && (
        <tr>
          <td colSpan={6} className="bg-papel px-3 py-3">
            <div className="flex flex-wrap items-end gap-2">
              <label className="grid flex-1 gap-1 text-[0.8125rem] font-medium">
                ¿Por qué se anula el recibo {String(a.recibo).padStart(6, "0")}? Queda en el historial.
                <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej.: monto digitado por error" autoFocus />
              </label>
              <Button size="sm" variant="destructive" disabled={pendiente || !motivo.trim()} onClick={anular}>
                Anular abono
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAnulando(false)} disabled={pendiente}>
                No anular
              </Button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
