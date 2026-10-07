"use client";

import { useState, useTransition } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Campo } from "@/components/campo";
import { fecha } from "@/lib/fechas";
import { leerMonto, lempiras } from "@/lib/lempiras";
import { METODOS, type MetodoPago } from "@/lib/finanzas";
import { registrarAbono } from "./actions";
import type { Abono, Plan } from "./datos";

const CONCEPTOS = ["Enganche", "Abono", "Cuota", "Liquidación"];

export function DialogoAbono({
  abierto,
  onCerrar,
  pacienteId,
  planes,
  abonos,
  planInicial,
}: {
  abierto: boolean;
  onCerrar: () => void;
  pacienteId: string;
  planes: Plan[];
  abonos: Abono[];
  planInicial: string | null;
}) {
  const sugerencia = (planId: string | null) => {
    const plan = planes.find((p) => p.id === planId);
    const cuota = plan?.planPago?.cuotas.find((c) => c.pendiente > 0 && c.estado !== "anulada");
    const sinAbonos = !abonos.some((a) => a.planId === planId && !a.anulado);
    if (plan?.planPago && plan.planPago.prima > 0 && sinAbonos) {
      return { cuotaId: "", monto: plan.planPago.prima, concepto: "Enganche" };
    }
    if (cuota) return { cuotaId: cuota.id, monto: cuota.pendiente, concepto: "Cuota" };
    return { cuotaId: "", monto: 0, concepto: "Abono" };
  };

  const inicial = sugerencia(planInicial);
  const [planId, setPlanId] = useState<string>(planInicial ?? "");
  const [cuotaId, setCuotaId] = useState(inicial.cuotaId);
  const [monto, setMonto] = useState(inicial.monto ? inicial.monto.toFixed(2) : "");
  const [concepto, setConcepto] = useState(inicial.concepto);
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [referencia, setReferencia] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();

  const plan = planes.find((p) => p.id === planId) ?? null;
  const cuotasAbiertas = plan?.planPago?.cuotas.filter((c) => c.pendiente > 0 && c.estado !== "anulada") ?? [];
  const meta = METODOS.find((m) => m.valor === metodo)!;
  const valor = leerMonto(monto);
  const quedaria = plan && valor !== null ? Math.max(plan.porPagar - valor, 0) : null;

  const elegirPlan = (id: string) => {
    setPlanId(id);
    const s = sugerencia(id || null);
    setCuotaId(s.cuotaId);
    setMonto(s.monto ? s.monto.toFixed(2) : "");
    setConcepto(s.concepto);
  };

  const elegirCuota = (id: string) => {
    setCuotaId(id);
    const c = cuotasAbiertas.find((x) => x.id === id);
    if (c) {
      setMonto(c.pendiente.toFixed(2));
      setConcepto("Cuota");
    }
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (valor === null || valor <= 0) return setError("Escribe el monto recibido.");
    if (plan && valor > plan.porPagar + 0.001) return setError(`El abono supera lo POR PAGAR del plan (${lempiras(plan.porPagar)}).`);
    if (meta.pideReferencia && !referencia.trim()) return setError(`Escribe el número de referencia de la ${meta.etiqueta.toLowerCase()}.`);

    iniciar(async () => {
      const r = await registrarAbono({
        pacienteId,
        planId: planId || null,
        cuotaId: cuotaId || null,
        monto: valor,
        metodo,
        referencia,
        concepto,
        notas,
      });
      if (!r.ok) return setError(r.error);
      toast.success(r.mensaje, {
        description: `Recibo N.º ${String(r.datos.recibo).padStart(6, "0")}`,
        action: { label: "Ver recibo", onClick: () => window.open(`/recibos/${r.datos.abonoId}`, "_blank") },
        duration: 10000,
      });
      onCerrar();
    });
  };

  return (
    <Dialog open={abierto} onOpenChange={(a) => !a && onCerrar()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-linea px-5 pt-5 pb-4">
          <DialogTitle className="text-lg">Registrar abono</DialogTitle>
          <DialogDescription>Se genera un recibo numerado que puedes imprimir o guardar en PDF.</DialogDescription>
        </DialogHeader>

        <form onSubmit={guardar} className="grid gap-4 px-5 py-5" noValidate>
          <Campo id="abono-plan" etiqueta="Plan de tratamiento">
            <NativeSelect id="abono-plan" value={planId} onChange={(e) => elegirPlan(e.target.value)}>
              {planes.map((p) => (
                <option key={p.id} value={p.id} disabled={p.porPagar <= 0}>
                  {p.titulo} — POR PAGAR {lempiras(p.porPagar)}
                </option>
              ))}
              <option value="">Sin plan (pago suelto)</option>
            </NativeSelect>
          </Campo>

          {cuotasAbiertas.length > 0 && (
            <Campo id="abono-cuota" etiqueta="Aplicar a la cuota" opcional>
              <NativeSelect id="abono-cuota" value={cuotaId} onChange={(e) => elegirCuota(e.target.value)}>
                <option value="">No aplicar a una cuota</option>
                {cuotasAbiertas.map((c) => (
                  <option key={c.id} value={c.id}>
                    Cuota {c.numero} · vence {fecha(c.vencimiento)} · por pagar {lempiras(c.pendiente)}
                    {c.estado === "vencida" ? " · VENCIDA" : ""}
                  </option>
                ))}
              </NativeSelect>
            </Campo>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="abono-monto" etiqueta="Monto recibido (Lps)">
              <Input id="abono-monto" value={monto} onChange={(e) => setMonto(e.target.value)} inputMode="decimal" className="cifras text-lg font-semibold" placeholder="0.00" autoFocus />
            </Campo>
            <Campo id="abono-concepto" etiqueta="Concepto">
              <NativeSelect id="abono-concepto" value={concepto} onChange={(e) => setConcepto(e.target.value)}>
                {CONCEPTOS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </NativeSelect>
            </Campo>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-[0.8125rem] text-grafito">Método de pago</legend>
            <div role="radiogroup" className="grid grid-cols-2 gap-1.5">
              {METODOS.map((m) => (
                <button
                  key={m.valor}
                  type="button"
                  role="radio"
                  aria-checked={metodo === m.valor}
                  onClick={() => setMetodo(m.valor)}
                  className={cn(
                    "h-10 rounded-md border border-linea px-3 text-left text-sm transition-colors hover:border-linea-fuerte",
                    metodo === m.valor && "border-azul bg-azul-fondo font-medium text-marino ring-1 ring-azul",
                  )}
                >
                  {m.etiqueta}
                </button>
              ))}
            </div>
          </fieldset>

          {meta.pideReferencia && (
            <Campo id="abono-referencia" etiqueta={metodo === "deposito" ? "Número de boleta" : metodo === "tarjeta" ? "Número de autorización" : "Número de referencia"}>
              <Input id="abono-referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} className="cifras" />
            </Campo>
          )}

          <Campo id="abono-notas" etiqueta="Observaciones" opcional>
            <Textarea id="abono-notas" rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} />
          </Campo>

          {plan && (
            <dl className="grid grid-cols-3 gap-2 rounded-md bg-papel px-3 py-2.5 text-[0.8125rem]">
              <div>
                <dt className="text-grafito-suave">Por pagar hoy</dt>
                <dd className="cifras font-semibold text-rojo">{lempiras(plan.porPagar)}</dd>
              </div>
              <div>
                <dt className="text-grafito-suave">Este abono</dt>
                <dd className="cifras font-semibold text-azul">{valor ? lempiras(valor) : "—"}</dd>
              </div>
              <div>
                <dt className="text-grafito-suave">Quedará por pagar</dt>
                <dd className="cifras font-semibold">{quedaria !== null ? lempiras(quedaria) : "—"}</dd>
              </div>
            </dl>
          )}

          {error && (
            <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-linea pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando && <LoaderCircleIcon className="animate-spin" aria-hidden />}
              {guardando ? "Registrando…" : valor ? `Registrar ${lempiras(valor)}` : "Registrar abono"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
