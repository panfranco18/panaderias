-- Controla qué categorías de productos aparecen en la home pública.
-- Por default todas visibles (no cambia nada hasta que el superadmin
-- desmarque alguna en /admin/productos).

create table if not exists public.categorias_config (
  categoria text primary key,
  visible_web boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.categorias_config enable row level security;

create policy "categorias_config_lectura_publica" on public.categorias_config
  for select using (true);

create policy "categorias_config_superadmin_escribe" on public.categorias_config
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

insert into public.categorias_config (categoria) values
  ('Panes'), ('Facturas'), ('Tortas'), ('Sandwiches'), ('Dulces'),
  ('Fiambres y Aceitunas'), ('Quesos'), ('Vinos'), ('Bebidas'),
  ('Yerba, Café y Mermeladas'), ('Limpieza'), ('Almacén Varios'), ('Lácteos'),
  ('Copetín'), ('Perfumería'), ('Varios'), ('Conservas'), ('Galletitas'),
  ('Golosinas'), ('Congelados, Leña y Mascotas'), ('Navidad'), ('Librería'),
  ('Cafetería'), ('Regalería'), ('Otros')
on conflict (categoria) do nothing;
