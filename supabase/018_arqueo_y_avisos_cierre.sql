-- Registro de cierres X/Z hechos (para no pasar de X a Z automáticamente
-- hasta que la empleada realmente haga el cierre, y para el histórico).
create table if not exists public.cierres_turno (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid not null references public.sucursales(id) on delete cascade,
  tipo text not null check (tipo in ('x', 'z')),
  fecha date not null default current_date,
  perfil_id uuid references public.perfiles(id) on delete set null,
  hora timestamptz not null default now()
);

create index if not exists idx_cierres_turno_sucursal_fecha on public.cierres_turno(sucursal_id, fecha, tipo);

alter table public.cierres_turno enable row level security;

create policy "cierres_turno_lectura_staff" on public.cierres_turno
  for select using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));

create policy "cierres_turno_escritura_staff" on public.cierres_turno
  for insert with check (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));

-- Clasificación obligatoria de cada venta hecha en Vender: Venta 1 o
-- Venta Deleite (arqueo de caja los separa).
alter table public.ventas
  add column if not exists venta_tipo text check (venta_tipo in ('venta_1', 'venta_deleite'));

-- Nuevo tipo de notificación: el cierre X puede demorarse un poco más
-- del horario de fin del turno mañana.
alter table public.notificaciones drop constraint if exists notificaciones_tipo_check;

alter table public.notificaciones
  add constraint notificaciones_tipo_check
  check (tipo in (
    'stock_bajo', 'cambio_precio', 'venta_registrada', 'faltante_reportado',
    'fichaje', 'cierre_x', 'cierre_z', 'cierre_demorado'
  ));
