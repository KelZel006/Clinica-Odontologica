---
version: 1
slug: "src-app"
primary_target: "src/app"
related_targets: []
---

# Sistema interno — shell y agenda

Modo: Operate. Usuarios: recepción (escritorio) y doctor (tablet / teléfono). Tarea principal: convertir solicitudes de la web en citas y llevar la jornada del día. Vista por defecto: Día. Confirmación de citas por WhatsApp vía n8n (la app muestra el estado, no envía).

Restricciones: los permisos vienen de `mis_permisos()`; la UI oculta, RLS protege. Sin datos de ejemplo que parezcan reales. Azul marino #0b3157 y logo de la web pública como ancla.

## Direction contract

THESIS: Toda la app habla la convención de tintas del odontograma impreso: azul = existente/hecho, rojo = pendiente/por hacer. Rechaza el calendario de colores arbitrarios por estado y las tarjetas KPI de software dental genérico.

OWN-WORLD: Papel clínico casi blanco (#fbfcfd), barra lateral azul marino #0b3157, texto grafito #24303d, tinta azul #1f4fa3 y tinta roja #c62f2f como únicos colores de estado; cuadrícula fina de ficha (líneas 1px #dfe5ec) como estructura; cifras tabulares para horas y montos.

STORY: Recepción abre la app y ve el día: qué está en rojo (por confirmar, solicitudes nuevas) y qué ya está en azul. Convierte cada solicitud roja en una cita azul sin salir de la pantalla.

FIRST VIEWPORT: Barra lateral azul marino (logo, Agenda, Pacientes, Tratamientos, Finanzas, usuario). Encabezado con la fecha, navegación de día y el tramo visible. Centro: la cuadrícula del día 8:00–18:00 con bloques de altura igual a su duración, tinta roja si está pendiente y azul si está confirmada o completada; una línea roja marca la hora actual. Derecha: la columna «Solicitudes» con contador en rojo y la acción «Agendar» en cada una. Acción primaria: «Nueva cita».

FORM: Tinta de odontograma — candidato 1 de mi lista ordenada; seed key be999a14 (re-roll 1, registro safer, elegida por el usuario).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
