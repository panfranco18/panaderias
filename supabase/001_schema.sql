-- =========================================================
-- Panadería — esquema inicial completo
-- Ejecutar en Supabase Dashboard > SQL Editor (proyecto wlqgcritlefztwrprboe)
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------
-- Sucursales
-- ---------------------------------------------------------
create table if not exists public.sucursales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  direccion text,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_sucursales_updated_at
  before update on public.sucursales
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- Perfiles (empleados / dueño) — 1 a 1 con auth.users
-- ---------------------------------------------------------
create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  cargo text,
  rol text not null default 'empleado' check (rol in ('superadmin', 'encargado_sucursal', 'empleado')),
  sucursal_id uuid references public.sucursales(id) on delete set null,
  nivel_acceso jsonb not null default '{}'::jsonb, -- ej: {"productos": true, "stock": true, "caja": false}
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_perfiles_updated_at
  before update on public.perfiles
  for each row execute function public.set_updated_at();

create index if not exists idx_perfiles_sucursal on public.perfiles(sucursal_id);

-- función helper para políticas (evita recursión de RLS)
create or replace function public.rol_actual()
returns text language sql stable security definer
set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid();
$$;

create or replace function public.sucursal_actual()
returns uuid language sql stable security definer
set search_path = public
as $$
  select sucursal_id from public.perfiles where id = auth.uid();
$$;

-- ---------------------------------------------------------
-- Productos
-- ---------------------------------------------------------
create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null, -- panes | facturas | tortas | sandwiches | otros...
  descripcion text,
  imagen_url text,
  precio_base numeric(10,2) not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_productos_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

-- precio distinto por sucursal (si no hay fila, se usa precio_base)
create table if not exists public.productos_precios_sucursal (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos(id) on delete cascade,
  sucursal_id uuid not null references public.sucursales(id) on delete cascade,
  precio numeric(10,2) not null,
  unique (producto_id, sucursal_id)
);

-- ---------------------------------------------------------
-- Proveedores y facturas de proveedor
-- ---------------------------------------------------------
create table if not exists public.proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  contacto text,
  notas text,
  created_at timestamptz not null default now()
);

create table if not exists public.facturas_proveedor (
  id uuid primary key default gen_random_uuid(),
  proveedor_id uuid references public.proveedores(id) on delete set null,
  sucursal_id uuid references public.sucursales(id) on delete set null,
  numero_factura text,
  monto numeric(10,2) not null,
  fecha date not null default current_date,
  imagen_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Stock
-- ---------------------------------------------------------
create table if not exists public.stock (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos(id) on delete cascade,
  sucursal_id uuid not null references public.sucursales(id) on delete cascade,
  cantidad numeric(10,2) not null default 0,
  unidad text not null default 'unidad',
  updated_at timestamptz not null default now(),
  unique (producto_id, sucursal_id)
);

create trigger trg_stock_updated_at
  before update on public.stock
  for each row execute function public.set_updated_at();

create table if not exists public.movimientos_stock (
  id uuid primary key default gen_random_uuid(),
  stock_id uuid not null references public.stock(id) on delete cascade,
  tipo text not null check (tipo in ('ingreso', 'egreso', 'ajuste')),
  cantidad numeric(10,2) not null,
  motivo text,
  usuario_id uuid references public.perfiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Ventas (online, en sucursal, o cargadas por escaneo de planilla)
-- ---------------------------------------------------------
create table if not exists public.ventas (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid not null references public.sucursales(id),
  origen text not null default 'sucursal' check (origen in ('online', 'sucursal', 'escaneo')),
  usuario_id uuid references public.perfiles(id) on delete set null,
  total numeric(10,2) not null default 0,
  metodo_pago text,
  fecha timestamptz not null default now(),
  planilla_imagen_url text, -- foto de la planilla escaneada, si aplica
  created_at timestamptz not null default now()
);

create index if not exists idx_ventas_sucursal_fecha on public.ventas(sucursal_id, fecha);

create table if not exists public.items_venta (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references public.ventas(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete set null,
  cantidad numeric(10,2) not null,
  precio_unitario numeric(10,2) not null,
  subtotal numeric(10,2) generated always as (cantidad * precio_unitario) stored
);

-- ---------------------------------------------------------
-- Facturación diaria (comprobante emitido por venta)
-- ---------------------------------------------------------
create table if not exists public.facturas_venta (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid references public.ventas(id) on delete cascade,
  numero text,
  cuit_cliente text,
  monto numeric(10,2) not null,
  fecha timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Caja
-- ---------------------------------------------------------
create table if not exists public.caja_movimientos (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid not null references public.sucursales(id),
  tipo text not null check (tipo in ('apertura', 'cierre', 'ingreso', 'egreso')),
  monto numeric(10,2) not null,
  descripcion text,
  usuario_id uuid references public.perfiles(id) on delete set null,
  fecha timestamptz not null default now()
);

create index if not exists idx_caja_sucursal_fecha on public.caja_movimientos(sucursal_id, fecha);

-- ---------------------------------------------------------
-- Registro de ingreso de personal (fichaje)
-- ---------------------------------------------------------
create table if not exists public.registro_ingreso_personal (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  sucursal_id uuid not null references public.sucursales(id),
  tipo text not null check (tipo in ('entrada', 'salida')),
  fecha timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Pedidos (online / carrito, y consultas de eventos y fiestas)
-- ---------------------------------------------------------
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_nombre text not null,
  cliente_telefono text,
  cliente_email text,
  sucursal_id uuid references public.sucursales(id),
  tipo text not null default 'online' check (tipo in ('online', 'evento')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmado', 'preparando', 'listo', 'entregado', 'cancelado')),
  notas text,
  total numeric(10,2) not null default 0,
  fecha_evento date,
  created_at timestamptz not null default now()
);

create table if not exists public.pedidos_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete set null,
  cantidad numeric(10,2) not null,
  precio_unitario numeric(10,2) not null
);

-- =========================================================
-- RLS
-- =========================================================
alter table public.sucursales enable row level security;
alter table public.perfiles enable row level security;
alter table public.productos enable row level security;
alter table public.productos_precios_sucursal enable row level security;
alter table public.proveedores enable row level security;
alter table public.facturas_proveedor enable row level security;
alter table public.stock enable row level security;
alter table public.movimientos_stock enable row level security;
alter table public.ventas enable row level security;
alter table public.items_venta enable row level security;
alter table public.facturas_venta enable row level security;
alter table public.caja_movimientos enable row level security;
alter table public.registro_ingreso_personal enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedidos_items enable row level security;

-- Productos: lectura pública (catálogo del sitio cliente)
create policy "productos_lectura_publica" on public.productos
  for select using (activo = true);

create policy "productos_precios_lectura_publica" on public.productos_precios_sucursal
  for select using (true);

create policy "sucursales_lectura_publica" on public.sucursales
  for select using (activa = true);

-- Pedidos: cualquiera puede crear (checkout público), pero no leer/editar sin ser staff
create policy "pedidos_insert_publico" on public.pedidos
  for insert with check (true);

create policy "pedidos_items_insert_publico" on public.pedidos_items
  for insert with check (true);

-- Perfiles: cada uno ve su propio perfil; superadmin ve todos
create policy "perfiles_propio" on public.perfiles
  for select using (id = auth.uid() or public.rol_actual() = 'superadmin');

create policy "perfiles_update_propio_o_superadmin" on public.perfiles
  for update using (id = auth.uid() or public.rol_actual() = 'superadmin');

create policy "perfiles_insert_superadmin" on public.perfiles
  for insert with check (public.rol_actual() = 'superadmin');

-- Staff (superadmin + encargado_sucursal + empleado) puede gestionar el resto,
-- acotado a su sucursal si no es superadmin.
create policy "sucursales_staff_all" on public.sucursales
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

create policy "productos_staff_write" on public.productos
  for all using (public.rol_actual() in ('superadmin', 'encargado_sucursal'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal'));

create policy "productos_precios_staff_write" on public.productos_precios_sucursal
  for all using (public.rol_actual() in ('superadmin', 'encargado_sucursal'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal'));

create policy "proveedores_superadmin" on public.proveedores
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

create policy "facturas_proveedor_superadmin" on public.facturas_proveedor
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

create policy "stock_por_sucursal" on public.stock
  for all using (
    public.rol_actual() = 'superadmin' or sucursal_id = public.sucursal_actual()
  )
  with check (
    public.rol_actual() = 'superadmin' or sucursal_id = public.sucursal_actual()
  );

create policy "movimientos_stock_por_sucursal" on public.movimientos_stock
  for all using (
    public.rol_actual() = 'superadmin'
    or stock_id in (select id from public.stock where sucursal_id = public.sucursal_actual())
  )
  with check (
    public.rol_actual() = 'superadmin'
    or stock_id in (select id from public.stock where sucursal_id = public.sucursal_actual())
  );

create policy "ventas_por_sucursal" on public.ventas
  for all using (
    public.rol_actual() = 'superadmin' or sucursal_id = public.sucursal_actual()
  )
  with check (
    public.rol_actual() = 'superadmin' or sucursal_id = public.sucursal_actual()
  );

create policy "items_venta_por_sucursal" on public.items_venta
  for all using (
    public.rol_actual() = 'superadmin'
    or venta_id in (select id from public.ventas where sucursal_id = public.sucursal_actual())
  )
  with check (
    public.rol_actual() = 'superadmin'
    or venta_id in (select id from public.ventas where sucursal_id = public.sucursal_actual())
  );

create policy "facturas_venta_staff" on public.facturas_venta
  for all using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));

create policy "caja_por_sucursal" on public.caja_movimientos
  for all using (
    public.rol_actual() = 'superadmin' or sucursal_id = public.sucursal_actual()
  )
  with check (
    public.rol_actual() = 'superadmin' or sucursal_id = public.sucursal_actual()
  );

create policy "registro_ingreso_por_sucursal" on public.registro_ingreso_personal
  for all using (
    public.rol_actual() = 'superadmin' or sucursal_id = public.sucursal_actual()
  )
  with check (
    public.rol_actual() = 'superadmin' or sucursal_id = public.sucursal_actual()
  );

create policy "pedidos_staff_all" on public.pedidos
  for all using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));

create policy "pedidos_items_staff_all" on public.pedidos_items
  for all using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));
