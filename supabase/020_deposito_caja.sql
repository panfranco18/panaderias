-- Depósitos: un empleado o el superadmin puede depositar parte o todo
-- el efectivo cobrado en el día. Se registra como un movimiento de
-- caja de tipo 'deposito', separado de 'ingreso' (que hoy ya se usa
-- para otra cosa: el efectivo que entra al cargar una planilla).
alter table public.caja_movimientos drop constraint if exists caja_movimientos_tipo_check;
alter table public.caja_movimientos
  add constraint caja_movimientos_tipo_check
  check (tipo in ('apertura', 'ingreso', 'egreso', 'cierre', 'deposito'));

alter table public.notificaciones drop constraint if exists notificaciones_tipo_check;
alter table public.notificaciones
  add constraint notificaciones_tipo_check
  check (tipo in (
    'stock_bajo', 'cambio_precio', 'venta_registrada', 'faltante_reportado',
    'fichaje', 'cierre_x', 'cierre_z', 'cierre_demorado', 'deposito'
  ));
