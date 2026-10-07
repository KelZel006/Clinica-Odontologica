-- =====================================================================
-- Tratamientos y finanzas: catálogo clínico completo, depósito bancario,
-- abonos que solo se anulan (nunca se editan ni se borran) y estado de cuenta.
-- Interfaz: ABONADO y POR PAGAR (nunca «deuda»). Moneda: Lempiras (Lps).
-- =====================================================================

alter type public.metodo_pago add value if not exists 'deposito';

-- ---------------------------------------------------------------------
-- Catálogo: información clínica del tratamiento
-- ---------------------------------------------------------------------
alter table public.tratamientos
  add column indicaciones         text,
  add column contraindicaciones   text,
  add column cuidados_posteriores text;

-- ---------------------------------------------------------------------
-- Abonos: concepto y anulación auditada
-- ---------------------------------------------------------------------
alter table public.abonos
  add column concepto    text not null default 'Abono',
  add column anulado_por uuid references public.perfiles(id),
  add column anulado_at  timestamptz;

create or replace function public.abonos_solo_anular()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.anulado then
    raise exception 'El abono ya está anulado';
  end if;
  if (new.paciente_id, new.plan_tratamiento_id, new.cuota_id, new.cita_id, new.monto, new.metodo,
      new.referencia, new.recibo_numero, new.pagado_at, new.notas, new.concepto, new.recibido_por, new.created_at)
     is distinct from
     (old.paciente_id, old.plan_tratamiento_id, old.cuota_id, old.cita_id, old.monto, old.metodo,
      old.referencia, old.recibo_numero, old.pagado_at, old.notas, old.concepto, old.recibido_por, old.created_at) then
    raise exception 'Un abono registrado no se modifica: anúlalo y registra uno nuevo';
  end if;
  if new.anulado then
    if coalesce(trim(new.motivo_anulacion), '') = '' then
      raise exception 'Para anular un abono hay que indicar el motivo';
    end if;
    new.anulado_por := auth.uid();
    new.anulado_at := now();
  end if;
  return new;
end $$;

-- El trigger de abono_completar_plan corre en «update of cuota_id»; este va antes que el de auditoría.
create trigger abonos_solo_anular before update on public.abonos
  for each row execute function public.abonos_solo_anular();

drop policy if exists "borrar (usuarios.administrar)" on public.abonos;

-- ---------------------------------------------------------------------
-- Un solo plan de pago activo por plan de tratamiento
-- ---------------------------------------------------------------------
create unique index planes_pago_un_activo on public.planes_pago (plan_tratamiento_id) where activo;

-- ---------------------------------------------------------------------
-- Estado de cuenta por paciente (planes vigentes: no rechazados)
--   costo_total − total_abonado = por_pagar
-- ---------------------------------------------------------------------
create view public.v_estado_cuenta with (security_invoker = true) as
select
  s.paciente_id,
  count(*)                       as planes,
  coalesce(sum(s.total), 0)      as costo_total,
  coalesce(sum(s.pagado), 0)     as total_abonado,
  coalesce(sum(s.saldo), 0)      as por_pagar
from public.v_saldo_planes s
where s.estado <> 'rechazado'
group by s.paciente_id;

revoke execute on function public.abonos_solo_anular() from public, anon, authenticated;
