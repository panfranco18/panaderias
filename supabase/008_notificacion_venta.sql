-- Agrega el tipo "venta_registrada" para avisarle al superadmin cuando
-- se registra una venta o un ingreso de caja en una sucursal.

alter table public.notificaciones drop constraint if exists notificaciones_tipo_check;

alter table public.notificaciones
  add constraint notificaciones_tipo_check
  check (tipo in ('stock_bajo', 'cambio_precio', 'venta_registrada'));
