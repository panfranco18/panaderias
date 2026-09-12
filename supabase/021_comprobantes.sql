-- Sistema de comprobantes (Factura A, Factura B, Remito, Presupuesto) +
-- numeración de tickets de venta. Esto es un generador de comprobantes
-- INTERNOS con el formato y los cálculos correctos (no está conectado
-- al webservice de AFIP, así que no tienen CAE ni son facturas
-- electrónicas oficiales — la factura fiscal real se sigue haciendo
-- por fuera, como ya lo hace el usuario).

-- Punto de venta por sucursal (cada una numera sus comprobantes por separado)
alter table public.sucursales
  add column if not exists punto_venta text not null default '0001';

with numeradas as (
  select id, row_number() over (order by created_at) as rn
  from public.sucursales
)
update public.sucursales s
set punto_venta = lpad(numeradas.rn::text, 4, '0')
from numeradas
where s.id = numeradas.id
  and s.punto_venta = '0001';

do $$
begin
  alter table public.sucursales add constraint sucursales_punto_venta_unique unique (punto_venta);
exception when duplicate_object then null;
end $$;

-- Datos fiscales del negocio, para el encabezado de los comprobantes
alter table public.configuracion_negocio
  add column if not exists razon_social text,
  add column if not exists cuit text,
  add column if not exists condicion_iva text check (
    condicion_iva in ('responsable_inscripto', 'monotributo', 'exento')
  ),
  add column if not exists ingresos_brutos text,
  add column if not exists inicio_actividades date;

-- Numeración de tickets de venta (para poder identificar una venta
-- puntual al armar un comprobante)
create sequence if not exists public.ventas_numero_ticket_seq;

alter table public.ventas
  add column if not exists numero_ticket bigint;

alter table public.ventas
  alter column numero_ticket set default nextval('public.ventas_numero_ticket_seq');

with numeradas as (
  select id, row_number() over (order by fecha, created_at) as rn
  from public.ventas
  where numero_ticket is null
)
update public.ventas v
set numero_ticket = numeradas.rn
from numeradas
where v.id = numeradas.id;

select setval(
  'public.ventas_numero_ticket_seq',
  coalesce((select max(numero_ticket) from public.ventas), 0) + 1,
  false
);

do $$
begin
  alter table public.ventas add constraint ventas_numero_ticket_unique unique (numero_ticket);
exception when duplicate_object then null;
end $$;

-- Numeración correlativa por tipo de comprobante + punto de venta
create table if not exists public.comprobantes_contadores (
  tipo text not null,
  punto_venta text not null,
  ultimo_numero bigint not null default 0,
  primary key (tipo, punto_venta)
);

create or replace function public.siguiente_numero_comprobante(p_tipo text, p_punto_venta text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_numero bigint;
begin
  insert into public.comprobantes_contadores (tipo, punto_venta, ultimo_numero)
  values (p_tipo, p_punto_venta, 1)
  on conflict (tipo, punto_venta)
  do update set ultimo_numero = comprobantes_contadores.ultimo_numero + 1
  returning ultimo_numero into v_numero;
  return v_numero;
end;
$$;

-- Comprobantes: factura A, factura B, remito, presupuesto
create table if not exists public.comprobantes (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid not null references public.sucursales(id),
  tipo text not null check (tipo in ('factura_a', 'factura_b', 'remito', 'presupuesto')),
  punto_venta text not null,
  numero bigint not null,
  venta_id uuid references public.ventas(id) on delete set null,
  cliente_nombre text,
  cliente_cuit text,
  cliente_domicilio text,
  cliente_condicion_iva text,
  porcentaje_iva numeric(5,2) not null default 21,
  subtotal numeric(10,2) not null default 0,
  iva numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  observaciones text,
  perfil_id uuid references public.perfiles(id) on delete set null,
  fecha timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (tipo, punto_venta, numero)
);

create index if not exists idx_comprobantes_sucursal_fecha on public.comprobantes(sucursal_id, fecha);

create table if not exists public.comprobante_items (
  id uuid primary key default gen_random_uuid(),
  comprobante_id uuid not null references public.comprobantes(id) on delete cascade,
  orden integer not null default 0,
  descripcion text not null,
  cantidad numeric(10,2) not null default 1,
  precio_unitario numeric(10,2) not null default 0,
  subtotal numeric(10,2) generated always as (cantidad * precio_unitario) stored
);

alter table public.comprobantes enable row level security;
alter table public.comprobante_items enable row level security;
alter table public.comprobantes_contadores enable row level security;

create policy "comprobantes_staff" on public.comprobantes
  for all using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));

create policy "comprobante_items_staff" on public.comprobante_items
  for all using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));

create policy "comprobantes_contadores_staff" on public.comprobantes_contadores
  for all using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));
