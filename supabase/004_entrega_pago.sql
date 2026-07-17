-- Horario de atención y costo de envío por sucursal
alter table public.sucursales
  add column if not exists horario_atencion text,
  add column if not exists costo_envio numeric(10,2) not null default 0;

-- Detalle de entrega y pago en los pedidos
alter table public.pedidos
  add column if not exists tipo_entrega text not null default 'retiro'
    check (tipo_entrega in ('retiro', 'envio')),
  add column if not exists direccion_entrega text,
  add column if not exists hora_retiro text,
  add column if not exists metodo_pago text,
  add column if not exists costo_envio numeric(10,2) not null default 0;

-- Configuración general del negocio (cuenta de MercadoPago para pagos manuales)
create table if not exists public.configuracion_negocio (
  id uuid primary key default gen_random_uuid(),
  mercadopago_alias text,
  mercadopago_titular text,
  mercadopago_cbu text,
  updated_at timestamptz not null default now()
);

alter table public.configuracion_negocio enable row level security;

create policy "configuracion_lectura_publica" on public.configuracion_negocio
  for select using (true);

create policy "configuracion_superadmin_escribe" on public.configuracion_negocio
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');
