"use client";

import { useState, useTransition } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Campo } from "@/components/campo";
import { hoyISO } from "@/lib/fechas";
import { leerMonto, lempiras } from "@/lib/lempiras";
import { ETIQUETA_FRECUENCIA, type FrecuenciaPago } from "@/lib/finanzas";
import { crearPlanPago } from "./actions";

export function FormularioPlanPago({
  pacienteId,
  planId,
  porPagar,
  onCerrar,
}: {
  pacienteId: string;
  planId: string;
  porPagar: number;
  onCerrar: () => void;
}) {
  const [prima, setPrima] = useState("");
  const [cuotas, setCuotas] = useState("6");
  const [frecuencia, setFrecuencia] = useState<FrecuenciaPago>("mensual");
  const [inicio, setInicio] = useState(hoyISO());
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();

  const enganche = prima ? (leerMonto(prima) ?? 0) : 0;
  const n = Number(cuotas);
  const montoCuota = Number.isInteger(n) && n > 0 ? (porPagar - enganche) / n : null;

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    iniciar(async () => {
      const r = await crearPlanPago({ pacienteId, planId, prima: String(enganche), numeroCuotas: cuotas, frecuencia, fechaInicio: inicio });
      if (r.ok) {
        toast.success(r.mensaje);
        onCerrar();
      } else setError(r.error);
    });
  };

  return (
    <form onSubmit={guardar} className="grid gap-4 rounded-md border border-linea bg-papel p-4" noValidate>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">Nuevo plan de pago</h3>
        <p className="cifras text-[0.8125rem] text-grafito-suave">A financiar: {lempiras(porPagar)}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Campo id={`prima-${planId}`} etiqueta="Enganche (Lps)" opcional>
          <Input id={`prima-${planId}`} value={prima} onChange={(e) => setPrima(e.target.value)} inputMode="decimal" className="cifras" placeholder="0.00" />
        </Campo>
        <Campo id={`cuotas-${planId}`} etiqueta="Número de cuotas">
          <Input id={`cuotas-${planId}`} value={cuotas} onChange={(e) => setCuotas(e.target.value)} inputMode="numeric" className="cifras" />
        </Campo>
        <Campo id={`frecuencia-${planId}`} etiqueta="Frecuencia">
          <NativeSelect id={`frecuencia-${planId}`} value={frecuencia} onChange={(e) => setFrecuencia(e.target.value as FrecuenciaPago)}>
            {(Object.keys(ETIQUETA_FRECUENCIA) as FrecuenciaPago[]).map((f) => (
              <option key={f} value={f}>
                {ETIQUETA_FRECUENCIA[f]}
              </option>
            ))}
          </NativeSelect>
        </Campo>
        <Campo id={`inicio-${planId}`} etiqueta="Primera cuota">
          <Input id={`inicio-${planId}`} type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="cifras" />
        </Campo>
      </div>
      {montoCuota !== null && montoCuota > 0 && (
        <p className="cifras text-sm">
          {n} {n === 1 ? "cuota" : "cuotas"} de <span className="font-semibold">{lempiras(Math.floor(montoCuota * 100) / 100)}</span>
          {enganche > 0 && <> después de un enganche de <span className="font-semibold">{lempiras(enganche)}</span></>}. La última cuota ajusta los centavos.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={guardando}>
          {guardando && <LoaderCircleIcon className="animate-spin" aria-hidden />}
          Crear plan de pago
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
