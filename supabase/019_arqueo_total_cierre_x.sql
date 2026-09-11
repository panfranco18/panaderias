-- Guarda el total de ventas del día en el momento del Cierre X, para
-- poder mostrarlo como referencia en el Arqueo de caja (sección Venta
-- Deleite).
alter table public.cierres_turno
  add column if not exists total_ventas numeric(10, 2);
