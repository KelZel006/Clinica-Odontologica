---
name: Clínica Dr. Elías Chirinos
description: Sistema interno de la clínica que habla la convención de tintas de la ficha dental impresa, azul para lo hecho y rojo para lo pendiente.
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
  odonto-caries: "#d93636"
  odonto-obturacion: "#7d8a99"
  odonto-sellante: "#5fa8e8"
  odonto-fractura: "#8a5a36"
  odonto-corona: "#163d7a"
  odonto-endodoncia: "#ef7a1a"
  odonto-implante: "#1593bf"
  odonto-protesis: "#7652c7"
  odonto-puente: "#5b3fa8"
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

# Sistema de diseño: Clínica Dr. Elías Chirinos

> Los títulos de nivel 2 (`## Overview`, `## Colors`…) conservan su nombre en inglés porque el formato DESIGN.md los exige así para que las herramientas lo lean; todo lo demás está en español.

## Overview
_Visión general_

**Idea rectora: «Tinta de odontograma»**

Toda la aplicación habla la convención de la ficha dental impresa: la tinta azul registra lo que existe, ya se hizo o está confirmado; la tinta roja registra lo que sigue pendiente. Todo lo demás es papel clínico, texto grafito y una cuadrícula fina, enmarcado por la barra azul marino de la clínica. El color nunca es decoración ni una paleta por categoría: es un vocabulario de dos tintas con significado fijo, para que recepción lea el estado del día de un vistazo.

El sistema es sereno, denso y operativo. Las superficies son casi blancas y planas, la estructura sale de líneas de 1px y no de tarjetas ni sombras, y toda hora y todo monto usa cifras tabulares. Tiene un solo tema claro porque la clínica trabaja con luz de día y fluorescente, en el escritorio de recepción y en una tablet junto al sillón. El idioma es español (es-HN), el dinero se expresa en Lempiras (`Lps 1,250.00`) y toda hora se calcula en America/Tegucigalpa.

Referencias descartadas: el calendario con un color arbitrario por estado y el tablero de tarjetas KPI del software dental genérico.

**Rasgos principales:**
- Solo dos tintas de estado: azul (hecho o confirmado) y rojo (pendiente).
- El azul marino se reserva para el marco de marca y la acción principal.
- Superficies de papel clínico, estructura con líneas de 1px, casi sin sombras.
- Cifras tabulares para toda hora, conteo, teléfono y monto.
- Solo tema claro; controles del tamaño adecuado para tablet.

## Colors
_Colores_

Una base fría, casi sin color, de papel y grafito, que lleva un azul marino de marca y dos tintas con significado.

### Primario
- **Marino de marca** (marino): la barra lateral, la barra superior en móvil, el panel de marca del login, el color de tema del navegador y el relleno de los botones principales («Nueva cita», «Agendar», «Marcar confirmada»). Es marco y compromiso, nunca estado.
- **Marino claro** (marino-claro): estado al pasar el cursor en botones marinos y en los elementos de la barra lateral.
- **Texto sobre marino** (marino-texto): texto secundario y etiquetas inactivas de navegación sobre marino.

### Secundario
- **Tinta azul** (tinta-azul): la tinta de «hecho / confirmado / existe». Relleno sólido de las citas atendidas, hora y estado de las confirmadas, la marca de verificación de WhatsApp, los contornos de foco y el cursor de texto.
- **Fondo azul** (tinta-azul-fondo): el tinte detrás de las citas confirmadas y de un paciente existente seleccionado; también el resaltado del texto seleccionado.

### Terciario
- **Tinta roja** (tinta-roja): la tinta de «pendiente / requiere atención». Contorno de las citas sin confirmar, la línea de la hora actual, los contadores pendientes (insignia del menú, «2 nuevas», «por confirmar»), las solicitudes nuevas de la web, los errores de formulario y la alerta de alergias.
- **Fondo rojo** (tinta-roja-fondo): fondo de las alertas de error y de la nota e insignia de alergias.
- **Rojo destructivo** (destructivo): un rojo más profundo, usado solo en acciones destructivas («Cancelar cita», «Descartar solicitud» con contorno), distinto de la tinta de pendiente.

### Neutros
- **Papel clínico** (papel): fondo de la aplicación y encabezados fijos.
- **Superficie** (superficie): columnas de la cuadrícula, paneles laterales, hojas, campos y tablas.
- **Bruma** (muted): filas al pasar el cursor, fondo de los controles segmentados y rayado del horario bloqueado.
- **Línea** (linea): todo divisor fino, la línea de cada media hora y el borde de los contenedores.
- **Línea fuerte** (linea-fuerte): la línea de cada hora en punto, bordes de campos, el separador discontinuo de acciones destructivas y el subrayado de enlaces.
- **Grafito** (grafito): texto principal y títulos.
- **Grafito suave** (grafito-suave): texto secundario, etiquetas, margen de horas y toda cita fuera de la agenda (cancelada, no asistió, reprogramada).

### Leyenda del odontograma
Se usa solo dentro del odontograma y en sus muestras de condición (ver «Excepción de la leyenda del odontograma»).
- **Caries** (odonto-caries), **Obturación** (odonto-obturacion), **Sellante** (odonto-sellante), **Fractura** (odonto-fractura): condiciones de superficie.
- **Corona** (odonto-corona), **Prótesis** (odonto-protesis), **Puente** (odonto-puente): rellenan toda la corona.
- **Endodoncia** (odonto-endodoncia): la línea del conducto dentro de cada raíz. **Implante** (odonto-implante): el tornillo roscado y su muestra.

### Reglas con nombre
**Regla de las tintas.** Azul significa existente, hecho o confirmado: confirmada es el tinte azul con texto azul; atendida es azul sólido. Rojo significa pendiente: una cita sin confirmar es un contorno rojo sobre blanco. Las citas canceladas, no asistidas o reprogramadas salen de la cuadrícula y aparecen en grafito tachadas en la lista «Fuera de la agenda». Ningún otro color comunica estado.

**Regla del marino no es tinta.** El azul marino se reserva para el marco de marca y las acciones principales. Nunca marca el estado de una cita, solicitud o registro.

**Regla del rojo es atención.** Fuera de la agenda, el rojo sigue significando «actúa sobre esto»: conteos pendientes, solicitudes nuevas, errores, alergias. Nunca se usa como decoración ni como énfasis que no pida nada al usuario.

**Excepción de la leyenda del odontograma.** Dentro del odontograma, y solo ahí, el color nombra la condición clínica, siguiendo la ficha impresa que el doctor ya conoce: caries #d93636, obturación #7d8a99, sellante #5fa8e8, fractura #8a5a36, corona #163d7a, endodoncia #ef7a1a, implante #1593bf, prótesis #7652c7, puente #5b3fa8; pieza ausente como una cruz grafito sobre la pieza atenuada, extracción indicada como cruz roja y lesión / otro como un anillo rojo discontinuo. La lógica de las dos tintas se conserva en el tipo de relleno: sólido es existente o realizado; rayado a 45° o línea discontinua es planificado. Las muestras de la leyenda (`Muestra`) repiten exactamente estos colores dondequiera que se nombre una condición (resumen clínico, panel de la pieza, historial).

## Typography
_Tipografía_

**Fuente de títulos:** Public Sans (vía next/font, con system-ui como respaldo)
**Fuente de texto:** Public Sans
**Fuente de etiquetas y cifras:** Public Sans con cifras tabulares (`cifras`)

**Carácter:** una sola sans sobria e institucional en tres pesos (400, 500, 600), con los juegos estilísticos cv11 y ss01 activos. La jerarquía sale de los saltos de tamaño y peso, nunca de mayúsculas ni de espaciado entre letras.

### Jerarquía
- **Display** (600, 2.25rem, 1.25): solo la frase del panel de marca del login.
- **Titular** (600, 1.25rem en móvil / 1.5rem desde 640px): títulos de página, incluida la fecha de la agenda («Martes, 6 de octubre»).
- **Título** (600, 1rem a 1.125rem): títulos de paneles laterales y hojas, nombre del paciente en el detalle de la cita.
- **Cuerpo** (400, 0.875rem): tablas, listas, definiciones y texto de formularios. Los campos usan 1rem en móvil para evitar el zoom y 0.875rem desde 768px.
- **Etiqueta** (500 a 600, 0.8125rem): etiquetas de campos, títulos de sección dentro de hojas, encabezados de tablas, la leyenda de conteos y datos secundarios.
- **Cifras** (600, 0.75rem, tabulares): horas dentro de los bloques, margen de horas y contadores. Las insignias bajan a 0.6875rem.

### Reglas con nombre
**Regla tabular.** Toda hora, fecha, conteo, teléfono, número de expediente y monto en Lempiras lleva cifras tabulares.

**Regla de la hora sin cortes.** Las horas formateadas usan espacios de no separación, para que «7:00 a. m.» nunca se parta entre líneas.

## Layout
_Distribución_

Marco de la aplicación: una barra lateral marino fija de 240px desde 768px; por debajo, una barra superior marino de 56px y una navegación inferior blanca de 64px con margen para el área segura. Los márgenes de página son de 16px y crecen a 24px desde 640px; hojas y paneles laterales tienen 20px de relleno.

La agenda es una cuadrícula vertical de un solo día. Cada hora mide 76px y la altura de cada bloque es la duración exacta de la cita. A la izquierda hay un margen de horas de 64px; varios doctores se convierten en columnas iguales separadas por 8px. Las horas fuera del horario de atención y el tiempo bloqueado llevan un rayado a 135°. La columna de solicitudes de la web (352px) queda fija a la derecha desde 1280px; por debajo se abre como hoja lateral desde el botón «Solicitudes», con su contador rojo.

El encabezado de la agenda es fijo y lleva la fecha, la navegación por días (anterior / Hoy / siguiente y un selector de fecha) y una leyenda de conteos: total, «por confirmar» en rojo, «confirmadas» en azul y «atendidas» en azul (marca cuadrada para el estado sólido). La leyenda reemplaza el tramo horario visible que pedía el planteamiento original, porque lo que importa es leer rojo contra azul de un vistazo.

El login se divide 1fr / 1.1fr desde 1024px: panel de marca marino a la izquierda y formulario a la derecha; una sola columna por debajo.

El odontograma ocupa el ancho disponible; desde 1280px el panel de la pieza queda fijo a la derecha (23rem) y por debajo se abre como hoja lateral.

### Reglas con nombre
**Regla de la duración.** La altura del bloque es la duración a 76px por hora, sin redondear para que se vea mejor; los bloques cortos se reducen a una línea (menos de 44px) o dos líneas (menos de 84px) en lugar de crecer.

## Elevation & Depth
_Elevación y profundidad_

Plano por defecto. La profundidad sale del escalón entre el papel y la superficie blanca y de las líneas de 1px. Las pocas sombras son pequeñas, teñidas de marino y funcionales.

### Vocabulario de sombras
- **Botón primario** (`box-shadow: 0 1px 2px rgb(11 49 87 / 0.25)`): elevación en reposo, solo en botones marinos.
- **Bloque al pasar** (`box-shadow: 0 2px 8px rgb(11 49 87 / 0.14)`): bloque de cita al pasar el cursor, junto con elevarlo sobre los vecinos.
- **Segmento activo** (`box-shadow: 0 1px 2px rgb(36 48 61 / 0.12)`): la opción seleccionada de un control segmentado.
- Hojas, diálogos y menús conservan la sombra de superposición de la librería; nunca se usa en contenido dentro de la página.

### Reglas con nombre
**Regla de la línea por debajo.** La línea roja de la hora actual pasa por debajo de los bloques de citas; los bloques se leen bien encima de ella y su etiqueta de hora queda en el margen de horas.

## Shapes
_Formas_

Suavemente redondeado, casi cuadrado: 4.8px en botones, campos, elementos de navegación y contenedores; 5px en los bloques de citas; 4px dentro de los controles segmentados; redondo completo solo para contadores y puntos de estado. Los bordes son de 1px sólidos; la única línea discontinua separa las acciones destructivas. Los marcadores de estado son puntos de 8px: rojo relleno para nuevo o pendiente, grafito hueco para ya atendido por recepción, círculo azul relleno para confirmado y cuadrado azul redondeado para atendido.

## Components
_Componentes_

### Botones
Sobrios y sólidos; una sola acción marino por zona.
- **Forma:** suavemente redondeada (rounded md).
- **Primario:** relleno marino, texto blanco de 14px en peso medio, 36px de alto; al pasar el cursor pasa a marino claro; se hunde 1px al presionarlo.
- **Grande:** 44px de alto y 16px de relleno; para el botón de entrar del login y las acciones pensadas para tablet.
- **Contorno:** relleno papel, borde línea, texto grafito; al pasar el cursor, bruma. Opciones secundarias («Atendida», «Ya la contacté»).
- **Fantasma:** transparente; al pasar el cursor, bruma. Para deshacer («Quitar confirmación», «No, mantenerla»).
- **Destructivo:** transparente con borde rojo destructivo al 30% y texto destructivo; al pasar el cursor, un baño rojo del 8%.
- **Foco:** anillo azul (3px al 50%) más el contorno global de 2px en tinta azul, separado 2px.

### Campos de formulario
- **Estilo:** superficie blanca, borde línea fuerte, 40px de alto, rounded md; select nativo con flecha grafito para que tablets y teléfonos abran el selector del sistema.
- **Foco:** el borde pasa a tinta azul con un anillo azul de 3px.
- **Error:** borde destructivo; mensaje debajo en 13px tinta roja. El texto de ayuda va en 13px grafito suave.
- **Ritmo:** etiqueta de 13px grafito, 6px hasta el control, 6px hasta el mensaje; «(opcional)» en grafito suave.

### Navegación
- **Barra lateral:** marino, emblema blanco y nombre de la clínica, elementos de 40px en marino-texto con iconos de 18px; al pasar el cursor, marino claro con texto blanco; el elemento activo es una pastilla blanca con texto marino. «Agenda» lleva el contador rojo de solicitudes pendientes. Usuario y rol van abajo, sobre una línea blanca al 10%.
- **Móvil:** barra superior marino de 56px con emblema y «Salir»; barra inferior blanca con pestañas de 64px, pestaña activa marino en semibold y contador rojo sobre el icono.

### Bloque de cita (elemento distintivo)
- **Por confirmar:** relleno blanco, contorno rojo al 55%, hora en rojo.
- **Confirmada:** relleno de tinte azul, contorno azul al 35%, hora y estado en azul.
- **Atendida:** azul sólido, texto blanco al 85% para los datos secundarios.
- **Contenido:** rango de hora, nombre del paciente en semibold, tratamiento en grafito suave y etiqueta de estado cuando el bloque es lo bastante alto. Todo el bloque es un solo botón cuyo nombre accesible lee hora, paciente, tratamiento y estado.

### Fila de solicitud web
Punto rojo y «Nueva» en rojo para las solicitudes nuevas; punto grafito hueco y «Contactada» cuando ya se atendió; teléfono con enlace a WhatsApp en cifras tabulares; «Agendar» en marino, «Ya la contacté» con contorno y «Descartar solicitud» (destructivo) guardado en el menú de más acciones, con un aviso para deshacer.

### Odontograma (elemento distintivo)
Un solo gráfico SVG en orden FDI, fiel a la ficha impresa: por arcada, la vista lateral externa (raíces hacia arriba), la vista oclusal y la vista lateral interna (raíces hacia abajo); la arcada superior se lee bucal / oclusal / palatina y la inferior lingual / oclusal / bucal. Los nombres de los cuadrantes van en las esquinas de cada arcada, los números de pieza en negrita con cifras tabulares, y hay una línea media discontinua por arcada. Cada pieza es un botón y cada superficie (mesial, distal, vestibular, palatina o lingual, oclusal o incisal, cervical, radicular) es una zona táctil que preselecciona esa superficie en el panel. El esmalte lleva un degradado vertical suave y las raíces un degradado crema cálido; los molares muestran surcos oclusales. Los implantes reemplazan las raíces por un tornillo roscado con su pilar en azul implante; la endodoncia dibuja un conducto naranja dentro de cada raíz. La pieza seleccionada recibe un contorno tinta azul sobre fondo azul. El cambio de dentición permanente / temporal va sobre el gráfico y la leyenda debajo. En teléfonos el gráfico se desplaza en horizontal con un mínimo de 44rem para que las piezas sigan siendo fáciles de tocar.

Los hallazgos nunca se editan: el panel ofrece «Marcar realizado» (agrega un hallazgo nuevo como realizado) y «Anular» con motivo obligatorio; los hallazgos anulados quedan tachados en el historial de la pieza.

### Estado de cuenta (finanzas)
Una franja de tres columnas con líneas de 1px, no tarjetas: Costo total (grafito), ABONADO (tinta azul) y POR PAGAR (tinta roja mientras sea mayor que cero). Se repite por paciente y por cada plan de tratamiento; los montos los calcula la base de datos (`v_saldo_planes`, `v_estado_cuenta`), nunca el navegador. Cada plan muestra sus partidas en tabla, su plan de pago con cuotas (Abonada en azul; Por pagar, Abono parcial y Vencida en rojo) y su historial de abonos con enlace al recibo. Un abono no se edita: se anula con motivo y queda tachado.

### Recibo
Hoja imprimible fuera del marco de la aplicación: logo, número de recibo grande en marino, paciente, monto en letras, concepto, método y referencia, el monto abonado sobre fondo azul y el resumen Costo / Total abonado / POR PAGAR. Líneas de firma al pie. Al imprimir desaparecen el botón y el fondo papel.

### Detalle de la cita
Hoja lateral derecha en todos los tamaños: paciente, fecha y hora en cifras tabulares, estado en su tinta, una lista de datos, la lista de confirmación por WhatsApp (marca azul cuando está hecho, anillo rojo hueco cuando está pendiente) y luego la barra de acciones. Las acciones destructivas van debajo de una línea discontinua y abren una confirmación en la misma hoja, con motivo opcional, antes de cancelar nada.

## Do's and Don'ts
_Qué hacer y qué no_

### Hacer:
- **Sí** pasar todo estado de cita por la tabla de tintas: pendiente con contorno rojo, confirmada con tinte azul, atendida azul sólido, fuera de la agenda en grafito tachado.
- **Sí** reservar el marino para la barra de marca y la acción principal de cada zona.
- **Sí** hacer que la altura del bloque sea la duración exacta, a 76px por hora.
- **Sí** poner horas, conteos, teléfonos y montos en Lempiras con cifras tabulares, con espacios de no separación dentro de las horas.
- **Sí** separar las acciones destructivas de la acción principal con una línea discontinua y una confirmación.
- **Sí** mantener los controles a tamaño de tablet: mínimo 36px en botones, 40px en campos y 44px en las acciones táctiles principales.
- **Sí** formatear en es-HN, Lempiras (prefijo `Lps`, dos decimales) y America/Tegucigalpa.
- **Sí** decir ABONADO y POR PAGAR en todo lo financiero; nunca «deuda» ni «pagado» como estado principal (una cuota cubierta se muestra como «Abonada»).

### No hacer:
- **No** introducir un tercer color de estado (verde, ámbar, morado) ni un color por tratamiento o por doctor fuera del odontograma; la leyenda clínica vive solo en el odontograma y sus muestras.
- **No** usar marino ni tinta azul como decoración; el azul sobre un registro siempre afirma que algo está confirmado o hecho.
- **No** agregar un tema oscuro.
- **No** construir tarjetas KPI ni recuadros de estadísticas teñidos; los conteos viven en la leyenda del encabezado como texto con puntos de tinta.
- **No** poner un botón destructivo junto a la acción principal sin la separación discontinua y la confirmación.
- **No** dibujar la línea de la hora actual por encima de los bloques de citas.
