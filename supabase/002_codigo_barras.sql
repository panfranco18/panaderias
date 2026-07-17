-- Agrega código de barras a productos (para el escaneo desde el celular en el POS)
alter table public.productos
  add column if not exists codigo_barras text unique;
