-- =====================================================================
-- Cada abono guarda una «fotografía» del saldo en el momento del pago.
-- El recibo debe mostrar lo que se debía cuando se emitió, no el saldo de hoy.
--   costo_al_momento   = costo total del plan cuando se registró el abono
--   abonado_antes      = lo abonado al plan antes de este recibo
--   por_pagar_despues  = lo que quedó POR PAGAR después de este abono
-- Se calculan en la base de datos al insertar y nunca se recalculan.
-- =====================================================================

alter table public.abonos
  add column costo_al_momento  numeric(12,2),
  add column abonado_antes     numeric(12,2),
  add column por_pagar_despues numeric(12,2);

-- ---------------------------------------------------------------------
-- Fotografía al registrar (corre después de abonos_completar_plan, por orden alfabético)
-- ---------------------------------------------------------------------
create or replace function public.abonos_foto_saldo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total  numeric(12,2);
  v_previo numeric(12,2);
begin
  if new.plan_tratamiento_id is null then
    return new;
  end if;

  select s.total into v_total from public.v_saldo_planes s where s.plan_id = new.plan_tratamiento_id;

  select coalesce(sum(a.monto), 0) into v_previo
  from public.abonos a
  where a.plan_tratamiento_id = new.plan_tratamiento_id and not a.anulado;

  new.costo_al_momento  := v_total;
  new.abonado_antes     := v_previo;
  new.por_pagar_despues := v_total - v_previo - new.monto;
  return new;
end $$;

create trigger abonos_foto_saldo before insert on public.abonos
  for each row execute function public.abonos_foto_saldo();

-- La fotografía tampoco se puede modificar después: se suma a lo que protege abonos_solo_anular.
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
      new.referencia, new.recibo_numero, new.pagado_at, new.notas, new.concepto, new.recibido_por, new.created_at,
      new.costo_al_momento, new.abonado_antes, new.por_pagar_despues)
     is distinct from
     (old.paciente_id, old.plan_tratamiento_id, old.cuota_id, old.cita_id, old.monto, old.metodo,
      old.referencia, old.recibo_numero, old.pagado_at, old.notas, old.concepto, old.recibido_por, old.created_at,
      old.costo_al_momento, old.abonado_antes, old.por_pagar_despues) then
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

-- ---------------------------------------------------------------------
-- Reconstruir la fotografía de los recibos ya emitidos.
-- Cuenta como «abonado antes» todo abono anterior que estaba vigente en ese momento
-- (aunque se haya anulado después). El costo es el del plan hoy: es lo mejor que se puede saber.
-- ---------------------------------------------------------------------
alter table public.abonos disable trigger abonos_solo_anular;

with previo as (
  select a.id,
         coalesce((
           select sum(b.monto)
           from public.abonos b
           where b.plan_tratamiento_id = a.plan_tratamiento_id
             and (b.pagado_at, b.recibo_numero) < (a.pagado_at, a.recibo_numero)
             and (not b.anulado or b.anulado_at > a.pagado_at)
         ), 0) as suma
  from public.abonos a
  where a.plan_tratamiento_id is not null
)
update public.abonos a
set costo_al_momento  = s.total,
    abonado_antes     = p.suma,
    por_pagar_despues = s.total - p.suma - a.monto
from previo p, public.v_saldo_planes s
where p.id = a.id
  and s.plan_id = a.plan_tratamiento_id
  and a.costo_al_momento is null;

alter table public.abonos enable trigger abonos_solo_anular;

revoke execute on function public.abonos_foto_saldo() from public, anon, authenticated;
