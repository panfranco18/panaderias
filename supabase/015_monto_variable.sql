-- Productos con monto variable: al venderlos, el cajero ingresa el importe
-- en el momento en vez de usar el precio_base fijo (ej: "Varios Despensa").

alter table public.productos
  add column if not exists monto_variable boolean not null default false;
