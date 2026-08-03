-- Notificaciones: stock bajo y cambios de precio de venta, para
-- avisarle al superadmin y a los empleados.

alter table public.productos
  add column if not exists stock_minimo numeric(10,2) not null default 0;

create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('stock_bajo', 'cambio_precio')),
  producto_id uuid references public.productos(id) on delete cascade,
  sucursal_id uuid references public.sucursales(id) on delete cascade,
  mensaje text not null,
  precio_anterior numeric(10,2),
  precio_nuevo numeric(10,2),
  cantidad_actual numeric(10,2),
  leida boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notificaciones_leida on public.notificaciones(leida);
create index if not exists idx_notificaciones_sucursal on public.notificaciones(sucursal_id);
create index if not exists idx_notificaciones_producto on public.notificaciones(producto_id);

alter table public.notificaciones enable row level security;

-- Todo el staff (empleado, encargado, superadmin) puede leer y marcar
-- como leídas sus notificaciones; se filtra por sucursal en la app.
create policy "notificaciones_staff_all" on public.notificaciones
  for all using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));
