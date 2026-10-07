# Clínica Odontológica - Dr. Elías Renato Chirinos

Sistema integral de gestión para clínica odontológica.

## Stack Tecnológico
- Next.js (App Router) + TypeScript
- Supabase
  - PostgreSQL (esquema en `supabase/migrations/`)
  - Supabase Auth (inicio de sesión)
  - Row Level Security (roles y permisos aplicados en la base de datos)
  - Storage (radiografías, fotos y documentos)
- Tailwind CSS + Shadcn/UI
- n8n (agenda desde la web y WhatsApp)

## Módulos
- Dashboard con estadísticas y gráficos
- Gestión de Pacientes (expediente completo)
- Odontograma interactivo (numeración FDI)
- Control de Citas y Calendario
- Catálogo de Tratamientos
- Módulo Financiero (Abonos y Planes de Pago en Lempiras)
- Roles y Permisos
- Auditoría

## Base de datos

| Área | Tablas |
|---|---|
| Usuarios | `perfiles`, `roles`, `permisos`, `rol_permisos` |
| Agenda | `doctores`, `horarios_atencion`, `bloqueos_agenda`, `citas`, `solicitudes_cita` |
| Expediente | `pacientes`, `notas_clinicas`, `odontograma`, `archivos_paciente` |
| Finanzas | `tratamientos`, `planes_tratamiento`, `plan_items`, `planes_pago`, `cuotas`, `abonos` |
| Otros | `mensajes_whatsapp`, `casos_clinicos`, `auditoria` |

Vistas: `v_agenda`, `v_odontograma_actual`, `v_saldo_planes`, `v_cuotas_estado`.
Funciones: `horarios_disponibles(fecha, tratamiento)`, `generar_cuotas(plan_pago_id)`, `mis_permisos()`.

La base de datos impide citas solapadas del mismo doctor y registra en `auditoria` cada cambio
(quién, cuándo, valores antes y después). La auditoría no se puede modificar ni borrar desde la app.

### Roles

| Permiso | administrador | doctor | recepcion | contabilidad |
|---|:-:|:-:|:-:|:-:|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Pacientes (ver / editar) | ✓ | ✓ | ✓ | ver |
| Expediente clínico, odontograma, radiografías | ✓ | ✓ | – | – |
| Citas y solicitudes | ✓ | ✓ | ✓ | – |
| Configurar agenda (horarios, bloqueos) | ✓ | – | – | – |
| Catálogo de tratamientos | ✓ | – | – | – |
| Finanzas (ver / registrar abonos) | ✓ | ver | ✓ | ✓ |
| Usuarios y permisos | ✓ | – | – | – |
| Auditoría | ✓ | – | – | ✓ |

Los permisos de cada rol se cambian en la tabla `rol_permisos`, sin tocar código.
Un usuario nuevo no tiene rol (no ve nada) hasta que un administrador se lo asigna.

## Configuración

1. `npm install`
2. Copia `.env.example` a `.env` y completa los valores (Supabase → **Connect** y **Project Settings → API Keys**).
   Para la app Next.js, copia también las variables `NEXT_PUBLIC_*` a `.env.local`.
   Sin `NEXT_PUBLIC_SUPABASE_ANON_KEY` la app solo muestra el login con un aviso.

### App

```bash
npm run dev        # http://localhost:3000
npm run build      # compilación de producción
npm run lint
npm run typecheck
```

| Ruta | Qué hace | Permiso |
|---|---|---|
| `/login` | Inicio de sesión con correo y contraseña (Supabase Auth) | — |
| `/agenda` | Jornada del día, solicitudes de la web, nueva cita, confirmar / atender / cancelar | `citas.ver` / `citas.editar` |
| `/pacientes` | Búsqueda, ficha, alta y edición de pacientes | `pacientes.ver` / `pacientes.editar` |
| `/sin-acceso` | Aviso para cuentas que aún no tienen rol | — |

La navegación se arma con `mis_permisos()`; lo que el rol no puede usar no aparece. Las Server Actions
vuelven a revisar el permiso y RLS es la barrera final. La dirección visual está en `DESIGN.md`.

### Comandos de base de datos

```bash
# Aplicar migraciones nuevas
npx supabase db push --db-url "$SUPABASE_DB_URL"

# Regenerar los tipos de TypeScript después de cambiar el esquema
npx supabase gen types typescript --db-url "$SUPABASE_DB_URL" --schema public > src/types/database.types.ts

# Revisar el esquema
npx supabase db lint --db-url "$SUPABASE_DB_URL"
```

Para cambiar el esquema, crea una migración nueva (`npx supabase migration new nombre`);
nunca edites una migración ya aplicada.

### Crear el primer administrador

1. Supabase → **Authentication → Users → Add user → Create new user**, con *Auto Confirm User* marcado.
2. Supabase → **SQL Editor**:
   ```sql
   update perfiles
   set rol_id = (select id from roles where nombre = 'administrador'),
       nombre_completo = 'Nombre del administrador'
   where correo = 'correo-del-admin@ejemplo.com';
   ```

Las credenciales nunca se guardan en el repositorio.
