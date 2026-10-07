---
name: Clínica Dr. Elías Chirinos
description: Internal clinic system that speaks the printed odontogram's ink convention, blue for done and red for pending.
colors:
  papel: "#fbfcfd"
  superficie: "#ffffff"
  muted: "#eef2f6"
  linea: "#e1e7ee"
  linea-fuerte: "#c3cdd8"
  grafito: "#24303d"
  grafito-suave: "#586777"
  marino: "#0b3157"
  marino-claro: "#164577"
  marino-texto: "#b9cbe0"
  tinta-azul: "#1f4fa3"
  tinta-azul-fondo: "#eaf0fa"
  tinta-roja: "#c62f2f"
  tinta-roja-fondo: "#fcecec"
  destructivo: "#a52222"
typography:
  display:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.25
  headline:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
  title:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "\"cv11\", \"ss01\""
  label:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
  cifras:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    fontFeature: "\"tnum\""
rounded:
  sm: "0.225rem"
  bloque: "5px"
  md: "0.3rem"
  lg: "0.375rem"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  gutter: "16px"
  panel: "20px"
  gutter-wide: "24px"
  hora: "76px"
components:
  button-primary:
    backgroundColor: "{colors.marino}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.marino-claro}"
  button-primary-lg:
    backgroundColor: "{colors.marino}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.grafito}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
  button-destructive:
    backgroundColor: "transparent"
    textColor: "{colors.destructivo}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  input:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.grafito}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "40px"
  nav-item:
    backgroundColor: "{colors.marino}"
    textColor: "{colors.marino-texto}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  nav-item-active:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.marino}"
  cita-por-confirmar:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.grafito}"
    rounded: "{rounded.bloque}"
    padding: "6px 10px"
  cita-confirmada:
    backgroundColor: "{colors.tinta-azul-fondo}"
    textColor: "{colors.grafito}"
    rounded: "{rounded.bloque}"
    padding: "6px 10px"
  cita-atendida:
    backgroundColor: "{colors.tinta-azul}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.bloque}"
    padding: "6px 10px"
  contador-pendientes:
    backgroundColor: "{colors.tinta-roja}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.full}"
    padding: "0 6px"
    height: "20px"
---

# Design System: Clínica Dr. Elías Chirinos

## Overview

**Creative North Star: "Tinta de odontograma"**

The whole app speaks the convention of the printed dental chart: blue ink records what exists, is done or is confirmed; red ink records what is still pending. Everything else is clinical paper, graphite text and a fine ruled grid, framed by the clinic's navy brand bar. Color is never decoration and never a per-category palette; it is a two-ink vocabulary with fixed meanings, so reception can read the state of the day at a glance.

The system is calm, dense and operational. Surfaces are near-white and flat, structure comes from 1px rules rather than cards or shadows, and every time and amount is set in tabular figures. It runs in a single light theme because the clinic works under daylight and fluorescent light, at a reception desk and on a tablet at the dental chair. Language is Spanish (es-HN), money is Lempiras (`L 1,250.00`), and every time is computed in America/Tegucigalpa.

The rejected references are the arbitrary color-per-status calendar and the KPI-card dashboard of generic dental software.

**Key Characteristics:**
- Two state inks only: blue (done or confirmed) and red (pending).
- Navy reserved for brand chrome and the primary action.
- Clinical paper surfaces, 1px ruled structure, almost no shadow.
- Tabular figures for every time, count, phone number and amount.
- Light theme only; tablet-sized targets.

## Colors

A cool, nearly colorless paper-and-graphite base carrying one brand navy and two meaningful inks.

### Primary
- **Marino de marca** (marino): the sidebar, the mobile top bar, the login brand panel, the browser theme color and the fill of primary buttons ("Nueva cita", "Agendar", "Marcar confirmada"). It is chrome and commitment, never state.
- **Marino claro** (marino-claro): hover for navy buttons and for sidebar items.
- **Texto sobre marino** (marino-texto): secondary text and inactive nav labels on navy.

### Secondary
- **Tinta azul** (tinta-azul): the "done / confirmed / exists" ink. Solid fill for attended appointments, time and status text on confirmed ones, the WhatsApp check mark, focus outlines and the text caret.
- **Fondo azul** (tinta-azul-fondo): the tint behind confirmed appointments and a selected existing patient; also the text-selection highlight.

### Tertiary
- **Tinta roja** (tinta-roja): the "pending / needs attention" ink. Outline of unconfirmed appointments, the current-time line, pending counters (nav badge, "2 nuevas", "por confirmar"), new web requests, field errors, the allergy alert.
- **Fondo rojo** (tinta-roja-fondo): background of error alerts and of the allergy note and badge.
- **Rojo destructivo** (destructivo): a deeper red used only for destructive actions (outlined "Cancelar cita", "Descartar solicitud"), kept distinct from the pending ink.

### Neutral
- **Papel clínico** (papel): app background and sticky headers.
- **Superficie** (superficie): grid columns, side panels, sheets, inputs, tables.
- **Bruma** (muted): hover rows, segmented-control track, blocked-time hatching.
- **Línea** (linea): every hairline divider, half-hour rule and container border.
- **Línea fuerte** (linea-fuerte): on-the-hour rule, input borders, the dashed destructive separator, link underlines.
- **Grafito** (grafito): body text and headings.
- **Grafito suave** (grafito-suave): secondary text, labels, hour margin, and every off-grid (cancelled, no-show, rescheduled) appointment.

### Named Rules
**The Ink Rule.** Blue means existing, done or confirmed: confirmed is the blue tint with blue type, attended is solid blue. Red means pending: an unconfirmed appointment is a red outline on white. Cancelled, no-show and rescheduled appointments leave the grid and appear in graphite with a strike-through in the "Fuera de la agenda" list. No other color communicates state.

**The Navy Is Not Ink Rule.** Navy is reserved for brand chrome and primary actions. It never marks an appointment, request or record state.

**The Red Is Attention Rule.** Red outside the appointment grid still means "act on this": pending counts, new requests, errors, allergies. Never use it for decoration or emphasis that asks nothing of the user.

## Typography

**Display Font:** Public Sans (via next/font, with system-ui fallback)
**Body Font:** Public Sans
**Label/Mono Font:** Public Sans with tabular figures (`cifras`)

**Character:** One sober, institutional sans in three weights (400, 500, 600), with stylistic sets cv11 and ss01 on. Hierarchy comes from size and weight steps, never from case or tracking.

### Hierarchy
- **Display** (600, 2.25rem, 1.25): only the login brand panel statement.
- **Headline** (600, 1.25rem mobile / 1.5rem from 640px): page titles, including the agenda date ("Martes, 6 de octubre").
- **Title** (600, 1rem to 1.125rem): side-panel and sheet titles, patient name in the appointment sheet.
- **Body** (400, 0.875rem): tables, lists, definitions, form text. Inputs use 1rem on mobile to avoid zoom, 0.875rem from 768px.
- **Label** (500 to 600, 0.8125rem): field labels, section headings inside sheets, table headers, the count legend, secondary meta.
- **Cifras** (600, 0.75rem, tabular): times inside blocks, hour margin, counters. Badges drop to 0.6875rem.

### Named Rules
**The Tabular Rule.** Every time, date, count, phone number, record number and Lempira amount carries tabular figures.

**The Unbroken Time Rule.** Formatted times use non-breaking spaces, so "7:00 a. m." never wraps across lines.

## Layout

App shell: a fixed 240px navy sidebar from 768px; below it, a 56px navy top bar plus a 64px white bottom navigation with safe-area padding. Page gutters are 16px, widening to 24px from 640px; sheets and side panels pad 20px.

The agenda is a single-day vertical grid. Each hour is 76px tall and block height equals the exact appointment duration. A 64px hour margin sits on the left; multiple doctors become equal columns 8px apart. Hours outside clinic opening and blocked time are hatched at 135 degrees. The web-requests column (352px) docks on the right from 1280px; below that it opens as a right sheet from the "Solicitudes" button with its red count.

The agenda header is sticky and carries the date, day navigation (previous / Hoy / next plus a date input), and a count legend: total, red "por confirmar", blue "confirmadas", blue "atendidas" (square marker for the solid state). The legend replaces the visible time range the original brief named, because the story is reading red versus blue at a glance.

Login splits 1fr / 1.1fr from 1024px: navy brand panel left, form right; single column below.

### Named Rules
**The Duration Rule.** Block height is duration at 76px per hour, nothing rounded up for looks; short blocks collapse to one line (under 44px) or two lines (under 84px) instead of growing.

## Elevation & Depth

Flat by default. Depth comes from the paper / white-surface step and 1px rules. The few shadows are small, navy-tinted and functional.

### Shadow Vocabulary
- **Botón primario** (`box-shadow: 0 1px 2px rgb(11 49 87 / 0.25)`): resting lift on navy buttons only.
- **Bloque al pasar** (`box-shadow: 0 2px 8px rgb(11 49 87 / 0.14)`): appointment block on hover, together with raising it above neighbors.
- **Segmento activo** (`box-shadow: 0 1px 2px rgb(36 48 61 / 0.12)`): the selected option of a segmented control.
- Sheets, dialogs and menus keep the library's overlay shadow; it is never used on in-page content.

### Named Rules
**The Line Under Rule.** The red current-time line runs beneath the appointment blocks; blocks stay legible over it, and its time pill sits in the hour margin.

## Shapes

Gently rounded, almost square: 4.8px on buttons, inputs, nav items and containers, 5px on appointment blocks, 4px inside segmented controls, full round only for counters and status dots. Borders are 1px solid; the single dashed rule separates destructive actions. Status markers are 8px dots: filled red for new or pending, hollow graphite for handled, filled blue circle for confirmed and a blue rounded square for attended.

## Components

### Buttons
Quiet and solid; one navy action per region.
- **Shape:** gently rounded (rounded md).
- **Primary:** navy fill, white 14px medium text, 36px tall; hover to marino claro; presses down 1px.
- **Large:** 44px tall, 16px padding; used for the login submit and tablet-first actions.
- **Outline:** paper fill, linea border, grafito text; hover bruma. Secondary choices ("Atendida", "Ya la contacté").
- **Ghost:** transparent; hover bruma. Reversals ("Quitar confirmación", "No, mantenerla").
- **Destructive:** transparent with a 30% destructive-red border and destructive text; hover 8% red wash.
- **Focus:** blue ring (3px at 50%) plus the global 2px tinta-azul outline, offset 2px.

### Inputs / Fields
- **Style:** white surface, linea-fuerte border, 40px tall, rounded md; native select with a graphite chevron so tablets and phones open the system picker.
- **Focus:** border turns tinta-azul with a 3px blue ring.
- **Error:** destructive border; message below in 13px tinta-roja. Help text in 13px grafito suave.
- **Field rhythm:** label 13px grafito, 6px gap to control, 6px gap to message; "(opcional)" in grafito suave.

### Navigation
- **Sidebar:** navy, white emblem and clinic name, 40px items in marino-texto with 18px icons; hover marino claro with white text; active item is a white pill with navy text. The Agenda item carries the red pending-requests counter. User and role sit at the bottom above a white 10% rule.
- **Mobile:** navy 56px top bar with emblem and "Salir"; white bottom bar with 64px tabs, active tab navy semibold, red counter on the icon.

### Appointment Block (signature)
- **Por confirmar:** white fill, red outline at 55%, red time.
- **Confirmada:** blue tint fill, blue outline at 35%, blue time and status.
- **Atendida:** solid blue, white text at 85% for meta.
- **Content:** time range, patient name semibold, treatment in grafito suave, status label when the block is tall enough. The whole block is one button whose accessible name reads time, patient, treatment and status.

### Web Request Row
Red dot and "Nueva" in red for new requests, hollow graphite dot and "Contactada" once handled; WhatsApp-linked phone in tabular figures; navy "Agendar", outline "Ya la contacté", and destructive "Descartar solicitud" tucked in the overflow menu with an undo toast.

### Appointment Sheet
Right sheet on all sizes: patient, date and time in tabular figures, status label in its ink, a definition list, a WhatsApp confirmation checklist (blue check when done, red hollow ring when pending), then the action bar. Destructive actions sit below a dashed linea-fuerte rule and open an inline confirmation with an optional reason before anything is cancelled.

## Do's and Don'ts

### Do:
- **Do** map every appointment state through the ink table: pending red outline, confirmed blue tint, attended solid blue, off-grid graphite with strike-through.
- **Do** keep navy for the brand bar and the primary action of each region.
- **Do** size block height to exact duration at 76px per hour.
- **Do** set times, counts, phones and Lempira amounts in tabular figures, with non-breaking spaces inside formatted times.
- **Do** separate destructive actions from the main action with a dashed rule and an inline confirmation.
- **Do** keep controls at tablet size: 36px minimum for buttons, 40px inputs, 44px for primary touch actions.
- **Do** format in es-HN, Lempiras (`L` prefix, two decimals) and America/Tegucigalpa.

### Don't:
- **Don't** introduce a third state color (green, amber, purple) or a color per treatment or doctor.
- **Don't** use navy or tinta-azul as decoration; blue on a record always asserts that something is confirmed or done.
- **Don't** add a dark theme.
- **Don't** build KPI cards or tinted stat tiles; counts live in the header legend as text with ink dots.
- **Don't** put a destructive button next to the primary action without the dashed separation and confirmation.
- **Don't** draw the current-time line over appointment blocks.
