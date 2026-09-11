-- Nuevo tipo de notificación: avisar al superadmin cuando un empleado
-- ingresa al sistema (fichaje entrada) o se retira (fichaje salida).

alter table public.notificaciones drop constraint if exists notificaciones_tipo_check;

alter table public.notificaciones
  add constraint notificaciones_tipo_check
  check (tipo in ('stock_bajo', 'cambio_precio', 'venta_registrada', 'faltante_reportado', 'fichaje'));
