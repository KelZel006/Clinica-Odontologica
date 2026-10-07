"use client";

import { useState, useTransition } from "react";
import { CheckIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Campo } from "@/components/campo";
import { fecha, hora } from "@/lib/fechas";
import {
  CONDICIONES,
  ETIQUETA_CARA,
  ETIQUETA_ESTADO,
  ORDEN_CONDICIONES,
  carasDePieza,
  marcasDePieza,
  nombrePieza,
  normalizarCara,
  type Cara,
  type Condicion,
  type EstadoHallazgo,
  type EstadoPieza,
  type Hallazgo,
  type Implante,
} from "@/components/odontograma/datos";
import { anularHallazgo, guardarImplante, marcarRealizado, registrarHallazgo, type DatosImplante } from "./actions";
import { Muestra } from "@/components/odontograma/muestra";
import type { TratamientoOpcion } from "./odontograma-paciente";

const DIAGNOSTICOS = [
  "Caries dental",
  "Caries secundaria",
  "Pulpitis reversible",
  "Pulpitis irreversible",
  "Necrosis pulpar",
  "Periodontitis apical",
  "Absceso periapical",
  "Fractura coronal",
  "Resto radicular",
  "Edentulismo parcial",
  "Movilidad dental",
  "Desgaste / abrasión",
];

const ESTADO_INICIAL: Partial<Record<Condicion, EstadoHallazgo>> = { extraccion_indicada: "planificado" };

type Props = {
  pacienteId: string;
  pieza: number;
  caraInicial: Cara | null;
  estado: EstadoPieza | undefined;
  historial: Hallazgo[];
  implante: Implante | null;
  tratamientos: TratamientoOpcion[];
  puedeEditar: boolean;
  onCerrar: () => void;
};

export function PanelPieza({ pacienteId, pieza, caraInicial, estado, historial, implante, tratamientos, puedeEditar, onCerrar }: Props) {
  const vigentes = marcasDePieza(estado);
  const tieneImplante = Boolean(estado?.raiz.implante);

  return (
    <div>
      <header className="flex items-start justify-between gap-3 border-b border-linea px-4 pt-4 pb-3">
        <div className="min-w-0">
          <h2 className="cifras text-lg font-semibold">Pieza {pieza}</h2>
          <p className="text-[0.8125rem] text-grafito-suave">{nombrePieza(pieza)}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onCerrar} aria-label="Cerrar detalle de la pieza">
          <XIcon />
        </Button>
      </header>

      <section aria-labelledby="vigente-titulo" className="border-b border-linea px-4 py-3.5">
        <h3 id="vigente-titulo" className="text-[0.8125rem] font-semibold">
          Estado actual
        </h3>
        {vigentes.length === 0 ? (
          <p className="mt-1 text-sm text-grafito-suave">Sin hallazgos: pieza sana.</p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {vigentes.map((m) => (
              <Vigente key={m.hallazgo.id} pacienteId={pacienteId} hallazgo={m.hallazgo} puedeEditar={puedeEditar} />
            ))}
          </ul>
        )}
      </section>

      {(tieneImplante || implante) && (
        <FichaImplante pacienteId={pacienteId} pieza={pieza} implante={implante} puedeEditar={puedeEditar} />
      )}

      {puedeEditar && <FormularioHallazgo pacienteId={pacienteId} pieza={pieza} caraInicial={caraInicial} tratamientos={tratamientos} />}

      <Historial historial={historial} />
    </div>
  );
}

function Vigente({ pacienteId, hallazgo: h, puedeEditar }: { pacienteId: string; hallazgo: Hallazgo; puedeEditar: boolean }) {
  const [anulando, setAnulando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [pendiente, iniciar] = useTransition();
  const meta = CONDICIONES[h.condicion];
  const planificado = h.estado === "planificado";

  const ejecutar = (accion: () => Promise<{ ok: boolean; mensaje?: string; error?: string }>) =>
    iniciar(async () => {
      const r = await accion();
      if (r.ok) toast.success(r.mensaje);
      else toast.error(r.error);
    });

  return (
    <li className={cn("rounded-md border px-3 py-2.5", planificado ? "border-rojo/45" : "border-linea", pendiente && "opacity-60")}>
      <div className="flex items-start gap-2">
        <Muestra condicion={h.condicion} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {meta.etiqueta}
            {h.cara !== "completa" && <span className="font-normal text-grafito-suave"> · {ETIQUETA_CARA[h.cara]}</span>}
          </p>
          <p className={cn("text-[0.8125rem]", planificado ? "font-medium text-rojo" : "text-azul")}>
            {ETIQUETA_ESTADO[h.estado]}
            <span className="font-normal text-grafito-suave"> · {fecha(h.creadoAt)}</span>
          </p>
          {(h.diagnostico || h.tratamiento) && (
            <p className="mt-1 text-[0.8125rem] text-grafito">
              {[h.diagnostico, h.tratamiento && `Tratamiento: ${h.tratamiento}`].filter(Boolean).join(" · ")}
            </p>
          )}
          {h.observacion && <p className="mt-0.5 text-[0.8125rem] text-grafito-suave">{h.observacion}</p>}
        </div>
      </div>
      {puedeEditar && !anulando && (
        <div className="mt-2 flex flex-wrap gap-2 pl-5.5">
          {planificado && (
            <Button size="sm" disabled={pendiente} onClick={() => ejecutar(() => marcarRealizado(pacienteId, h.id))}>
              <CheckIcon aria-hidden />
              Marcar realizado
            </Button>
          )}
          <Button size="sm" variant="ghost" className="text-grafito-suave" disabled={pendiente} onClick={() => setAnulando(true)}>
            Anular
          </Button>
        </div>
      )}
      {anulando && (
        <div className="mt-2 grid gap-2 border-t border-dashed border-linea-fuerte pt-2">
          <label htmlFor={`motivo-${h.id}`} className="text-[0.8125rem] font-medium">
            ¿Por qué se anula? Queda en el historial.
          </label>
          <Input id={`motivo-${h.id}`} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej.: registrado en la pieza equivocada" autoFocus />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={pendiente || !motivo.trim()}
              onClick={() => ejecutar(() => anularHallazgo(pacienteId, h.id, motivo))}
            >
              Anular hallazgo
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAnulando(false)} disabled={pendiente}>
              No anular
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function FormularioHallazgo({
  pacienteId,
  pieza,
  caraInicial,
  tratamientos,
}: {
  pacienteId: string;
  pieza: number;
  caraInicial: Cara | null;
  tratamientos: TratamientoOpcion[];
}) {
  const disponibles = carasDePieza(pieza);
  const inicial = caraInicial && caraInicial !== "completa" ? normalizarCara(pieza, caraInicial) : null;
  const [condicion, setCondicion] = useState<Condicion | null>(null);
  const [caras, setCaras] = useState<Cara[]>(inicial ? [inicial] : []);
  const [completa, setCompleta] = useState(false);
  const [estado, setEstado] = useState<EstadoHallazgo>("existente");
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamientoId, setTratamientoId] = useState("");
  const [observacion, setObservacion] = useState("");
  const [implante, setImplante] = useState<DatosImplante>({});
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();

  const meta = condicion ? CONDICIONES[condicion] : null;
  const porPieza = meta?.piezaCompleta ?? false;

  const elegirCondicion = (c: Condicion) => {
    setCondicion(c);
    setEstado(ESTADO_INICIAL[c] ?? "existente");
    setError(null);
  };

  const alternarCara = (c: Cara) => {
    setCompleta(false);
    setCaras((actual) => (actual.includes(c) ? actual.filter((x) => x !== c) : [...actual, c]));
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!condicion) return setError("Elige qué encontraste o qué se hizo.");
    const lista: Cara[] = porPieza || completa ? ["completa"] : caras;
    if (lista.length === 0) return setError("Marca al menos una superficie.");
    iniciar(async () => {
      const r = await registrarHallazgo({
        pacienteId,
        pieza,
        caras: lista,
        condicion,
        estado,
        diagnostico,
        tratamientoId,
        observacion,
        implante: condicion === "implante" ? implante : undefined,
      });
      if (r.ok) {
        toast.success(r.mensaje);
        setCondicion(null);
        setCaras([]);
        setCompleta(false);
        setDiagnostico("");
        setTratamientoId("");
        setObservacion("");
        setImplante({});
      } else setError(r.error);
    });
  };

  return (
    <form onSubmit={guardar} className="grid gap-4 border-b border-linea px-4 py-4" noValidate>
      <h3 className="text-[0.8125rem] font-semibold">Registrar hallazgo o tratamiento</h3>

      <fieldset>
        <legend className="mb-1.5 text-[0.8125rem] text-grafito">Condición</legend>
        <div role="radiogroup" className="grid grid-cols-2 gap-1.5">
          {ORDEN_CONDICIONES.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={condicion === c}
              onClick={() => elegirCondicion(c)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-md border border-linea px-2.5 text-left text-sm transition-colors hover:border-linea-fuerte",
                condicion === c && "border-azul bg-azul-fondo font-medium text-marino ring-1 ring-azul",
              )}
            >
              <Muestra condicion={c} />
              <span className="leading-tight">{CONDICIONES[c].etiqueta}</span>
            </button>
          ))}
        </div>
        {meta && <p className="mt-1.5 text-[0.8125rem] text-grafito-suave">{meta.ayuda}</p>}
      </fieldset>

      {condicion && !porPieza && (
        <fieldset>
          <legend className="mb-1.5 text-[0.8125rem] text-grafito">Superficies</legend>
          <div className="flex flex-wrap gap-1.5">
            {disponibles.map((c) => {
              const activa = !completa && caras.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => alternarCara(c)}
                  className={cn(
                    "h-9 rounded-full border border-linea-fuerte px-3 text-sm transition-colors hover:border-azul",
                    activa && "border-azul bg-azul font-medium text-white hover:text-white",
                  )}
                >
                  {ETIQUETA_CARA[c]}
                </button>
              );
            })}
            {condicion === "sano" && (
              <button
                type="button"
                aria-pressed={completa}
                onClick={() => setCompleta((v) => !v)}
                className={cn(
                  "h-9 rounded-full border border-linea-fuerte px-3 text-sm transition-colors hover:border-azul",
                  completa && "border-azul bg-azul font-medium text-white",
                )}
              >
                Toda la pieza
              </button>
            )}
          </div>
        </fieldset>
      )}

      {condicion && condicion !== "sano" && (
        <fieldset>
          <legend className="mb-1.5 text-[0.8125rem] text-grafito">Estado</legend>
          <div role="radiogroup" className="grid grid-cols-3 rounded-md bg-muted p-1 text-sm">
            {(["existente", "planificado", "realizado"] as const).map((e) => (
              <button
                key={e}
                type="button"
                role="radio"
                aria-checked={estado === e}
                onClick={() => setEstado(e)}
                className={cn(
                  "h-8 rounded-[4px] text-grafito-suave transition-colors",
                  estado === e && "bg-superficie font-medium shadow-[0_1px_2px_rgb(36_48_61/0.12)]",
                  estado === e && (e === "planificado" ? "text-rojo" : "text-azul"),
                )}
              >
                {ETIQUETA_ESTADO[e]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {condicion === "implante" && (
        <fieldset className="grid gap-3 rounded-md border border-linea bg-papel p-3">
          <legend className="px-1 text-[0.8125rem] font-semibold">Ficha del implante</legend>
          <CamposImplante datos={implante} onCambio={setImplante} prefijo="nuevo" />
        </fieldset>
      )}

      {condicion && condicion !== "sano" && (
        <>
          <Campo id="diagnostico" etiqueta="Diagnóstico" opcional>
            <Input id="diagnostico" list="diagnosticos" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} autoComplete="off" />
            <datalist id="diagnosticos">
              {DIAGNOSTICOS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </Campo>
          <Campo id="tratamiento-hallazgo" etiqueta="Tratamiento del catálogo" opcional>
            <NativeSelect id="tratamiento-hallazgo" value={tratamientoId} onChange={(e) => setTratamientoId(e.target.value)}>
              <option value="">Ninguno</option>
              {tratamientos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </NativeSelect>
          </Campo>
        </>
      )}

      {condicion && (
        <Campo id="observacion" etiqueta="Observación" opcional>
          <Textarea id="observacion" rows={2} value={observacion} onChange={(e) => setObservacion(e.target.value)} />
        </Campo>
      )}

      {error && (
        <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
          {error}
        </p>
      )}

      <Button type="submit" disabled={guardando || !condicion}>
        {guardando && <LoaderCircleIcon className="animate-spin" aria-hidden />}
        {guardando ? "Guardando…" : `Guardar en pieza ${pieza}`}
      </Button>
    </form>
  );
}

function CamposImplante({ datos, onCambio, prefijo }: { datos: DatosImplante; onCambio: (d: DatosImplante) => void; prefijo: string }) {
  const campo = (k: keyof DatosImplante) => ({
    id: `${prefijo}-${k}`,
    value: datos[k] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onCambio({ ...datos, [k]: e.target.value }),
  });
  return (
    <div className="grid grid-cols-2 gap-3">
      <Campo id={`${prefijo}-marca`} etiqueta="Marca" opcional>
        <Input {...campo("marca")} />
      </Campo>
      <Campo id={`${prefijo}-modelo`} etiqueta="Modelo" opcional>
        <Input {...campo("modelo")} />
      </Campo>
      <Campo id={`${prefijo}-diametroMm`} etiqueta="Diámetro (mm)" opcional>
        <Input {...campo("diametroMm")} inputMode="decimal" className="cifras" placeholder="4.1" />
      </Campo>
      <Campo id={`${prefijo}-longitudMm`} etiqueta="Longitud (mm)" opcional>
        <Input {...campo("longitudMm")} inputMode="decimal" className="cifras" placeholder="10" />
      </Campo>
      <Campo id={`${prefijo}-fechaColocacion`} etiqueta="Colocación" opcional>
        <Input {...campo("fechaColocacion")} type="date" className="cifras" />
      </Campo>
      <Campo id={`${prefijo}-fechaCarga`} etiqueta="Carga" opcional>
        <Input {...campo("fechaCarga")} type="date" className="cifras" />
      </Campo>
      <Campo id={`${prefijo}-observaciones`} etiqueta="Observaciones" opcional className="col-span-2">
        <Textarea {...campo("observaciones")} rows={2} />
      </Campo>
    </div>
  );
}

function FichaImplante({
  pacienteId,
  pieza,
  implante,
  puedeEditar,
}: {
  pacienteId: string;
  pieza: number;
  implante: Implante | null;
  puedeEditar: boolean;
}) {
  const aTexto = (i: Implante | null): DatosImplante => ({
    marca: i?.marca ?? "",
    modelo: i?.modelo ?? "",
    diametroMm: i?.diametroMm?.toString() ?? "",
    longitudMm: i?.longitudMm?.toString() ?? "",
    fechaColocacion: i?.fechaColocacion ?? "",
    fechaCarga: i?.fechaCarga ?? "",
    observaciones: i?.observaciones ?? "",
  });
  const [editando, setEditando] = useState(false);
  const [datos, setDatos] = useState<DatosImplante>(aTexto(implante));
  const [guardando, iniciar] = useTransition();

  const guardar = () =>
    iniciar(async () => {
      const r = await guardarImplante(pacienteId, pieza, implante?.id ?? null, datos);
      if (r.ok) {
        toast.success(r.mensaje);
        setEditando(false);
      } else toast.error(r.error);
    });

  const filas: [string, string | null][] = implante
    ? [
        ["Marca y modelo", [implante.marca, implante.modelo].filter(Boolean).join(" · ") || null],
        ["Medidas", implante.diametroMm || implante.longitudMm ? `${implante.diametroMm ?? "—"} × ${implante.longitudMm ?? "—"} mm` : null],
        ["Colocación", implante.fechaColocacion ? fecha(implante.fechaColocacion) : null],
        ["Carga", implante.fechaCarga ? fecha(implante.fechaCarga) : null],
        ["Observaciones", implante.observaciones],
      ]
    : [];

  return (
    <section aria-labelledby="implante-titulo" className="border-b border-linea px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <h3 id="implante-titulo" className="flex items-center gap-2 text-[0.8125rem] font-semibold">
          <Muestra condicion="implante" /> Ficha del implante
        </h3>
        {puedeEditar && !editando && (
          <Button size="sm" variant="ghost" onClick={() => setEditando(true)}>
            {implante ? "Editar" : "Completar ficha"}
          </Button>
        )}
      </div>
      {editando ? (
        <div className="mt-3 grid gap-3">
          <CamposImplante datos={datos} onCambio={setDatos} prefijo="ficha" />
          <div className="flex gap-2">
            <Button size="sm" onClick={guardar} disabled={guardando}>
              Guardar ficha
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditando(false)} disabled={guardando}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : implante ? (
        <dl className="mt-2 grid grid-cols-[7rem_1fr] gap-x-2 gap-y-1 text-[0.8125rem]">
          {filas.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-grafito-suave">{k}</dt>
              <dd className={cn("cifras", !v && "text-grafito-suave")}>{v ?? "—"}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-1 text-[0.8125rem] text-grafito-suave">Aún no se registran marca, medidas ni fechas.</p>
      )}
    </section>
  );
}

function Historial({ historial }: { historial: Hallazgo[] }) {
  return (
    <section aria-labelledby="historial-titulo" className="px-4 py-3.5">
      <h3 id="historial-titulo" className="text-[0.8125rem] font-semibold">
        Historial de la pieza <span className="cifras font-normal text-grafito-suave">({historial.length})</span>
      </h3>
      {historial.length === 0 ? (
        <p className="mt-1 text-[0.8125rem] text-grafito-suave">Todavía no hay registros en esta pieza.</p>
      ) : (
        <ol className="mt-2 grid gap-0">
          {historial.map((h) => (
            <li key={h.id} className="relative border-l border-linea-fuerte pb-3 pl-4 last:pb-0">
              <span
                aria-hidden
                className={cn(
                  "absolute top-1 -left-[5px] size-2.5 rounded-full border-2 border-superficie",
                  h.anulado ? "bg-linea-fuerte" : h.estado === "planificado" ? "bg-rojo" : "bg-azul",
                )}
              />
              <p className={cn("text-sm", h.anulado && "text-grafito-suave line-through")}>
                <span className="font-medium">{CONDICIONES[h.condicion].etiqueta}</span>
                {h.cara !== "completa" && ` · ${ETIQUETA_CARA[h.cara].toLowerCase()}`} · {ETIQUETA_ESTADO[h.estado].toLowerCase()}
              </p>
              <p className="cifras text-[0.75rem] text-grafito-suave">
                {fecha(h.creadoAt)}, {hora(h.creadoAt)}
                {h.registradoPor && ` · ${h.registradoPor}`}
              </p>
              {(h.diagnostico || h.tratamiento) && !h.anulado && (
                <p className="text-[0.75rem] text-grafito">{[h.diagnostico, h.tratamiento].filter(Boolean).join(" · ")}</p>
              )}
              {h.anulado && <p className="text-[0.75rem] text-grafito-suave">Anulado: {h.motivoAnulacion}</p>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
