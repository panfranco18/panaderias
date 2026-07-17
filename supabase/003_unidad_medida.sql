-- Unidad de venta por producto (para vender por kg/gramos, no solo por unidad)
alter table public.productos
  add column if not exists unidad_medida text not null default 'unidad'
  check (unidad_medida in ('unidad', 'kg', 'gramo', 'docena'));
