-- Categorías con conteo diario (ej: Panes, Facturas, Tortas) y su
-- declaración de cantidad inicial por sucursal/día, para verlo en vivo
-- en el panel inicio (cantidad inicial - vendido hoy = restante).

alter table public.categorias_config
  add column if not exists requiere_declaracion_diaria boolean not null default false;

create table if not exists public.stock_diario_categoria (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid not null references public.sucursales(id) on delete cascade,
  categoria text not null,
  fecha date not null,
  cantidad_inicial numeric not null,
  perfil_id uuid references public.perfiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (sucursal_id, categoria, fecha)
);

create index if not exists idx_stock_diario_categoria_fecha on public.stock_diario_categoria(fecha);
create index if not exists idx_stock_diario_categoria_sucursal on public.stock_diario_categoria(sucursal_id);

alter table public.stock_diario_categoria enable row level security;

create policy "stock_diario_categoria_lectura_staff" on public.stock_diario_categoria
  for select using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));

create policy "stock_diario_categoria_escritura_encargado" on public.stock_diario_categoria
  for insert with check (public.rol_actual() in ('superadmin', 'encargado_sucursal'));

create policy "stock_diario_categoria_actualizacion_encargado" on public.stock_diario_categoria
  for update using (public.rol_actual() in ('superadmin', 'encargado_sucursal'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal'));
