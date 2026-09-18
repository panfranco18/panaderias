-- Arqueo de caja con comparación Ventas vs Valores (pedido por Alicia,
-- 2026-09-18): compara el total de ventas (en negro = Venta 1,
-- registradas = Venta Deleite) contra la plata efectivamente
-- identificada (Posnet, Tarjeta, Mercado Pago, Transferencias,
-- Depósitos, Gastos y el efectivo contado a mano en el momento). Si
-- el arqueo está bien hecho, los dos totales tienen que dar igual.
-- Queda guardado como un registro con historial, con observaciones.
create table if not exists public.arqueos_caja (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid not null references public.sucursales(id),
  fecha date not null,
  perfil_id uuid references public.perfiles(id) on delete set null,

  ventas_negro numeric(10,2) not null default 0,
  ventas_registradas numeric(10,2) not null default 0,
  ventas_sin_clasificar numeric(10,2) not null default 0,
  total_ventas numeric(10,2) not null default 0,

  valor_posnet numeric(10,2) not null default 0,
  valor_tarjeta numeric(10,2) not null default 0,
  valor_mercadopago numeric(10,2) not null default 0,
  valor_transferencias numeric(10,2) not null default 0,
  valor_depositos numeric(10,2) not null default 0,
  valor_gastos numeric(10,2) not null default 0,
  valor_efectivo_contado numeric(10,2) not null default 0,
  total_valores numeric(10,2) not null default 0,

  diferencia numeric(10,2) not null default 0,
  observaciones text,

  created_at timestamptz not null default now()
);

create index if not exists idx_arqueos_caja_sucursal_fecha on public.arqueos_caja(sucursal_id, fecha desc, created_at desc);

alter table public.arqueos_caja enable row level security;

create policy "arqueos_caja_staff" on public.arqueos_caja
  for all using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));
