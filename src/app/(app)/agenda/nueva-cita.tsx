"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircleIcon, SearchIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Campo } from "@/components/campo";
import { hora as fmtHora } from "@/lib/fechas";
import { mostrarTelefono, normalizarTelefono } from "@/lib/telefono";
import { buscarPacientes, crearCita, obtenerHorarios, type HorarioLibre, type PacienteEncontrado } from "./actions";
import type { SolicitudAgenda, TratamientoOpcion } from "./tipos";

export type Prellenado = { fecha: string; hora?: string; doctorId?: string; solicitud?: SolicitudAgenda };

export function NuevaCita({
  prellenado,
  hoy,
  tratamientos,
  onCerrar,
}: {
  prellenado: Prellenado | null;
  hoy: string;
  tratamientos: TratamientoOpcion[];
  onCerrar: () => void;
}) {
  const solicitud = prellenado?.solicitud;
  const [modo, setModo] = useState<"existente" | "nuevo">(solicitud ? "nuevo" : "existente");
  const [paciente, setPaciente] = useState<PacienteEncontrado | null>(null);
  const [consulta, setConsulta] = useState("");
  const [busqueda, setBusqueda] = useState<{ consulta: string; lista: PacienteEncontrado[] } | null>(null);
  const [nombre, setNombre] = useState(solicitud?.nombre ?? "");
  const [telefono, setTelefono] = useState(
    solicitud ? mostrarTelefono(normalizarTelefono(solicitud.telefono) ?? solicitud.telefono) : "",
  );
  const [tratamientoId, setTratamientoId] = useState(solicitud?.tratamientoId ?? "");
  const [fecha, setFecha] = useState(prellenado?.fecha ?? hoy);
  const [cargados, setCargados] = useState<{ clave: string; lista: HorarioLibre[] | null } | null>(null);
  const [elegido, setElegido] = useState<HorarioLibre | null>(null);
  const [motivo, setMotivo] = useState(solicitud?.motivo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();

  const tratamiento = tratamientos.find((t) => t.id === tratamientoId) ?? null;
  const claveHorarios = `${fecha}|${tratamiento?.slug ?? ""}`;
  const listos = cargados?.clave === claveHorarios;
  const horarios = listos ? cargados.lista : null;
  const consultaValida = modo === "existente" && consulta.trim().length >= 2;
  const resultados = busqueda?.consulta === consulta ? busqueda.lista : [];
  const buscando = consultaValida && busqueda?.consulta !== consulta;
  const varios = new Set(horarios?.map((h) => h.doctorId)).size > 1;

  // Horarios libres para la fecha y la duración del tratamiento elegido.
  useEffect(() => {
    if (!prellenado) return;
    let vigente = true;
    obtenerHorarios(fecha, tratamiento?.slug ?? null)
      .catch(() => null)
      .then((lista) => {
      if (!vigente) return;
      setCargados({ clave: `${fecha}|${tratamiento?.slug ?? ""}`, lista });
      setElegido((actual) => {
        if (!lista) return null;
        const mismo = actual && lista.find((h) => h.inicio === actual.inicio && h.doctorId === actual.doctorId);
        if (mismo) return mismo;
        if (prellenado.hora && fecha === prellenado.fecha) {
          return (
            lista.find(
              (h) =>
                fmtHora24(h.inicio) === prellenado.hora && (!prellenado.doctorId || h.doctorId === prellenado.doctorId),
            ) ?? null
          );
        }
        return null;
      });
    });
    return () => {
      vigente = false;
    };
  }, [fecha, tratamiento?.slug, prellenado]);

  // Búsqueda de pacientes con una pequeña espera mientras se escribe.
  useEffect(() => {
    if (!consultaValida) return;
    let vigente = true;
    const t = setTimeout(async () => {
      const lista = await buscarPacientes(consulta).catch(() => [] as PacienteEncontrado[]);
      if (vigente) setBusqueda({ consulta, lista });
    }, 250);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [consulta, consultaValida]);

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (modo === "existente" && !paciente) return setError("Busca y elige al paciente, o registra uno nuevo.");
    if (modo === "nuevo" && !nombre.trim()) return setError("Escribe el nombre del paciente.");
    if (modo === "nuevo" && !normalizarTelefono(telefono))
      return setError("El teléfono debe tener 8 dígitos (o incluir el código de país).");
    if (!elegido) return setError("Elige una hora disponible.");

    const datos = new FormData();
    if (modo === "existente" && paciente) datos.set("paciente_id", paciente.id);
    else {
      datos.set("nombre", nombre);
      datos.set("telefono", telefono);
    }
    datos.set("tratamiento_id", tratamientoId);
    datos.set("doctor_id", elegido.doctorId);
    datos.set("inicio", elegido.inicio);
    datos.set("fin", elegido.fin);
    datos.set("motivo", motivo);
    if (solicitud) datos.set("solicitud_id", solicitud.id);

    iniciar(async () => {
      const r = await crearCita(datos);
      if (r.ok) {
        toast.success(r.mensaje);
        onCerrar();
      } else setError(r.error);
    });
  };

  return (
    <Dialog open={prellenado !== null} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-linea px-5 pt-5 pb-4">
          <DialogTitle className="text-lg">{solicitud ? "Agendar solicitud" : "Nueva cita"}</DialogTitle>
          <DialogDescription>
            {solicitud
              ? `Solicitud de ${solicitud.nombre}. Al guardar, la solicitud queda como agendada.`
              : "La cita queda «por confirmar» hasta que el paciente responda por WhatsApp."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={guardar} className="grid gap-5 px-5 py-5" noValidate>
          <fieldset className="grid gap-3">
            <legend className="mb-2 text-[0.8125rem] font-semibold">Paciente</legend>
            <div role="radiogroup" aria-label="Tipo de paciente" className="grid grid-cols-2 rounded-md bg-muted p-1">
              {(["existente", "nuevo"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={modo === m}
                  onClick={() => setModo(m)}
                  className={cn(
                    "h-8 rounded-[4px] text-sm text-grafito-suave transition-colors",
                    modo === m && "bg-superficie font-medium text-grafito shadow-[0_1px_2px_rgb(36_48_61/0.12)]",
                  )}
                >
                  {m === "existente" ? "Ya es paciente" : "Paciente nuevo"}
                </button>
              ))}
            </div>

            {modo === "existente" ? (
              paciente ? (
                <div className="flex items-center gap-3 rounded-md border border-azul/35 bg-azul-fondo px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{paciente.nombre}</p>
                    <p className="cifras text-[0.8125rem] text-grafito-suave">
                      Exp. {paciente.expediente} · {mostrarTelefono(paciente.telefono)}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => setPaciente(null)} aria-label="Cambiar paciente">
                    <XIcon />
                  </Button>
                </div>
              ) : (
                <div>
                  <label htmlFor="buscar-paciente" className="sr-only">
                    Buscar paciente
                  </label>
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-grafito-suave" aria-hidden />
                    <Input
                      id="buscar-paciente"
                      value={consulta}
                      onChange={(e) => setConsulta(e.target.value)}
                      placeholder="Nombre, teléfono o n.º de expediente"
                      className="pl-9"
                      autoComplete="off"
                      autoFocus
                    />
                    {buscando && (
                      <LoaderCircleIcon className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-grafito-suave" aria-hidden />
                    )}
                  </div>
                  {consultaValida && !buscando && (
                    <ul className="mt-2 max-h-56 divide-y divide-linea overflow-y-auto rounded-md border border-linea" aria-label="Resultados">
                      {resultados.length === 0 ? (
                        <li className="px-3 py-3 text-sm text-grafito-suave">
                          Nadie coincide con «{consulta.trim()}».{" "}
                          <button type="button" className="font-medium text-marino underline" onClick={() => { setModo("nuevo"); setNombre(consulta.trim()); }}>
                            Registrarlo como paciente nuevo
                          </button>
                        </li>
                      ) : (
                        resultados.map((p) => (
                          <li key={p.id}>
                            <button
                              type="button"
                              onClick={() => setPaciente(p)}
                              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-muted"
                            >
                              <span className="truncate text-sm font-medium">{p.nombre}</span>
                              <span className="cifras shrink-0 text-[0.8125rem] text-grafito-suave">
                                {mostrarTelefono(p.telefono)} · Exp. {p.expediente}
                              </span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              )
            ) : (
              <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
                <Campo id="nombre-paciente" etiqueta="Nombre completo">
                  <Input id="nombre-paciente" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="off" />
                </Campo>
                <Campo id="telefono-paciente" etiqueta="WhatsApp" ayuda="8 dígitos">
                  <Input
                    id="telefono-paciente"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    inputMode="tel"
                    placeholder="9999-8888"
                    className="cifras"
                  />
                </Campo>
              </div>
            )}
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
            <Campo id="tratamiento" etiqueta="Tratamiento">
              <NativeSelect id="tratamiento" value={tratamientoId} onChange={(e) => setTratamientoId(e.target.value)}>
                <option value="">Sin indicar (30 min)</option>
                {tratamientos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} ({t.duracion} min)
                  </option>
                ))}
              </NativeSelect>
            </Campo>
            <Campo id="fecha-cita" etiqueta="Fecha">
              <Input id="fecha-cita" type="date" min={hoy} value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} className="cifras" />
            </Campo>
          </div>

          <fieldset>
            <legend className="mb-2 text-[0.8125rem] font-semibold">
              Hora{tratamiento ? ` · ${tratamiento.duracion} min` : ""}
            </legend>
            {listos && horarios === null ? (
              <p role="alert" className="rounded-md bg-rojo-fondo px-3 py-2.5 text-sm text-rojo">
                No se pudieron cargar los horarios. Revisa tu conexión y vuelve a elegir la fecha.
              </p>
            ) : horarios === null ? (
              <p className="flex items-center gap-2 text-sm text-grafito-suave">
                <LoaderCircleIcon className="size-4 animate-spin" aria-hidden /> Buscando horarios libres…
              </p>
            ) : horarios.length === 0 ? (
              <p className="rounded-md bg-muted px-3 py-2.5 text-sm text-grafito-suave">
                No hay horarios libres ese día para esta duración. Prueba con otra fecha.
              </p>
            ) : (
              <div role="radiogroup" aria-label="Horarios disponibles" className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {horarios.map((h) => {
                  const activo = elegido?.inicio === h.inicio && elegido.doctorId === h.doctorId;
                  return (
                    <button
                      key={h.doctorId + h.inicio}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => setElegido(h)}
                      className={cn(
                        "cifras h-10 rounded-md border border-linea-fuerte bg-superficie px-2 text-sm transition-colors hover:border-azul hover:text-azul",
                        activo && "border-azul bg-azul font-semibold text-white hover:text-white",
                      )}
                    >
                      {h.etiqueta}
                      {varios && <span className="block truncate text-[0.6875rem]">{h.doctor}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>

          <Campo id="motivo" etiqueta="Motivo o nota" opcional>
            <Textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} />
          </Campo>

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
              {guardando ? "Guardando…" : elegido ? `Agendar a las ${fmtHora(elegido.inicio)}` : "Agendar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Hora local de la clínica en formato 24 h ("09:30"), para comparar con el hueco elegido en la cuadrícula. */
function fmtHora24(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Tegucigalpa",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
