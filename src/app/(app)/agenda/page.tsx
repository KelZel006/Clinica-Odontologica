import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { exigirPermiso, puede } from "@/lib/sesion";
import { diaSemana, esFechaISO, hoyISO, rangoDia } from "@/lib/fechas";
import { AgendaDia } from "./agenda-dia";
import type { BloqueoAgenda, CitaAgenda, DoctorAgenda, SolicitudAgenda, TratamientoOpcion } from "./tipos";

export const metadata: Metadata = { title: "Agenda" };

export default async function AgendaPage({ searchParams }: PageProps<"/agenda">) {
  const sesion = await exigirPermiso("citas.ver");
  const { fecha: fechaParam } = await searchParams;
  const hoy = hoyISO();
  const fecha = esFechaISO(fechaParam) ? fechaParam : hoy;
  const { desde, hasta } = rangoDia(fecha);

  const supabase = await createClient();
  const [doctores, horarios, citas, bloqueos, solicitudes, tratamientos] = await Promise.all([
    supabase.from("doctores").select("id, nombre").eq("activo", true).order("nombre"),
    supabase.from("horarios_atencion").select("doctor_id, hora_inicio, hora_fin").eq("dia_semana", diaSemana(fecha)),
    supabase
      .from("citas")
      .select(
        "id, inicio, fin, estado, motivo, notas, origen, confirmada_at, recordatorio_enviado_at, motivo_cancelacion, doctor_id, pacientes(id, nombre_completo, telefono, numero_expediente), tratamientos(nombre)",
      )
      .gte("inicio", desde)
      .lt("inicio", hasta)
      .order("inicio"),
    supabase.from("bloqueos_agenda").select("id, doctor_id, inicio, fin, motivo").lt("inicio", hasta).gt("fin", desde),
    supabase
      .from("solicitudes_cita")
      .select(
        "id, nombre, telefono, correo, motivo, tratamiento_id, fecha_preferida, horario_preferido, estado, origen, created_at, tratamientos(nombre)",
      )
      .in("estado", ["nueva", "contactada"])
      .order("created_at", { ascending: true })
      .limit(50),
    supabase.from("tratamientos").select("id, slug, nombre, duracion_minutos").eq("activo", true).order("orden"),
  ]);

  const error = [doctores, horarios, citas, bloqueos, solicitudes, tratamientos].find((r) => r.error)?.error;

  return (
    <AgendaDia
      fecha={fecha}
      hoy={hoy}
      puedeEditar={puede(sesion, "citas.editar")}
      puedeEscribirNota={puede(sesion, "expediente.editar")}
      errorCarga={error ? "No se pudo cargar parte de la agenda. Recarga la página." : null}
      doctores={(doctores.data ?? []).map((d): DoctorAgenda => ({ id: d.id, nombre: d.nombre }))}
      horarios={(horarios.data ?? []).map((h) => ({ doctorId: h.doctor_id, inicio: h.hora_inicio, fin: h.hora_fin }))}
      citas={(citas.data ?? []).flatMap((c): CitaAgenda[] =>
        c.pacientes
          ? [
              {
                id: c.id,
                inicio: c.inicio,
                fin: c.fin,
                estado: c.estado,
                motivo: c.motivo,
                notas: c.notas,
                origen: c.origen,
                confirmadaAt: c.confirmada_at,
                recordatorioEnviadoAt: c.recordatorio_enviado_at,
                motivoCancelacion: c.motivo_cancelacion,
                doctorId: c.doctor_id,
                paciente: {
                  id: c.pacientes.id,
                  nombre: c.pacientes.nombre_completo,
                  telefono: c.pacientes.telefono,
                  expediente: c.pacientes.numero_expediente,
                },
                tratamiento: c.tratamientos?.nombre ?? null,
              },
            ]
          : [],
      )}
      bloqueos={(bloqueos.data ?? []).map(
        (b): BloqueoAgenda => ({ id: b.id, doctorId: b.doctor_id, inicio: b.inicio, fin: b.fin, motivo: b.motivo }),
      )}
      solicitudes={(solicitudes.data ?? []).map(
        (s): SolicitudAgenda => ({
          id: s.id,
          nombre: s.nombre,
          telefono: s.telefono,
          correo: s.correo,
          motivo: s.motivo,
          tratamientoId: s.tratamiento_id,
          tratamiento: s.tratamientos?.nombre ?? null,
          fechaPreferida: s.fecha_preferida,
          horarioPreferido: s.horario_preferido,
          estado: s.estado,
          origen: s.origen,
          creadaAt: s.created_at,
        }),
      )}
      tratamientos={(tratamientos.data ?? []).map(
        (t): TratamientoOpcion => ({ id: t.id, slug: t.slug, nombre: t.nombre, duracion: t.duracion_minutos }),
      )}
    />
  );
}
