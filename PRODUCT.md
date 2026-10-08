# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS + Shadcn/UI, Supabase (PostgreSQL, Auth, Row Level Security, Storage). La app aún no está creada; el esquema de base de datos ya está en `supabase/migrations/`.

## Users

- **El doctor (Dr. Elías Renato Chirinos)**: consulta y escribe el expediente, el odontograma y las notas clínicas, muchas veces junto al paciente en el sillón; revisa su agenda del día, también desde el teléfono.
- **Recepción / asistente**: organiza la agenda, atiende las solicitudes que llegan de la web, registra pacientes, confirma citas por WhatsApp y cobra abonos.

Contabilidad existe como rol en el sistema, pero hoy nadie la usa en el día a día.

## Product Purpose

Sistema interno de gestión de la clínica odontológica: agenda, pacientes con expediente completo, odontograma FDI, catálogo de tratamientos, finanzas en Lempiras (planes de tratamiento, planes de pago, cuotas y abonos), usuarios con roles y auditoría.

Éxito = la clínica deja el papel y las hojas sueltas: cada solicitud, cita, hallazgo clínico y pago queda registrado en un solo lugar.

## Positioning

Hecho a la medida de una clínica de implantología en Honduras: el flujo de agenda conecta con la web pública y WhatsApp, y las finanzas siguen la práctica real de planes de pago y abonos en Lempiras para tratamientos grandes.

## Operating Context

- **Prioridad 1: Citas y agenda.** Recibir las solicitudes de la web (vía n8n, tabla `solicitudes_cita`), convertirlas en citas y organizar la agenda del doctor.
- Ubicación: Danlí, El Paraíso, Honduras (Barrio Abajo, frente a Ferretería Manineña).
- Horario: lunes a viernes 8:00–18:00, sábado 8:00–13:00. Zona horaria America/Tegucigalpa (la oficial de todo Honduras; no es la dirección).
- Dispositivos: computadora en recepción y consultorio; tablet en el sillón para odontograma y notas; teléfono para consultar la agenda o un paciente fuera de la clínica.
- Idioma: español (Honduras). Moneda: Lempiras (L).

## Capabilities and Constraints

- Roles: administrador, doctor, recepción, contabilidad. Los permisos se aplican en la base de datos (RLS); la interfaz debe ocultar lo que el rol no puede usar (`mis_permisos()`), nunca ser la única barrera.
- Recepción no ve expediente clínico, odontograma ni radiografías.
- La base de datos bloquea citas solapadas del mismo doctor; `horarios_disponibles()` da los huecos libres.
- La auditoría es de solo lectura y no se puede borrar.
- Odontograma con numeración FDI (permanentes 11–48, temporales 51–85), por pieza y cara, con historial.
- Archivos clínicos en el bucket privado `expedientes`.

## Brand Commitments

- Nombre: Clínica Odontológica — Dr. Elías Renato Chirinos.
- Logo compartido con la web pública (`logo-clinica.png` en el proyecto `clinica-chirinos`).

## Evidence on Hand

- Datos iniciales: un doctor, 5 tratamientos, horario semanal.
- No hay pacientes reales cargados todavía. No inventar datos de ejemplo que parezcan reales en pantallas de producción.

## Product Principles

1. **La agenda primero**: lo más usado debe estar a un toque desde cualquier pantalla.
2. **Rápido en el sillón**: registrar un hallazgo o una nota con el paciente delante toma segundos, en tablet.
3. **Cada rol ve solo lo suyo**: menos ruido para recepción, privacidad clínica garantizada.
4. **Nada se pierde**: cada cambio queda auditado; anular en lugar de borrar.
