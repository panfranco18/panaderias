-- Turno mañana / turno tarde por sucursal, y si el turno mañana habilita
-- el botón "Cierre X" para el personal (si no, esa sucursal solo usa
-- "Cierre Z"). Además, dos tipos nuevos de notificación para avisarle al
-- superadmin cuando el personal hace un cierre X o Z.

create table if not exists public.config_turnos_caja (
  sucursal_id uuid primary key references public.sucursales(id) on delete cascade,
  turno_manana_inicio time not null default '06:00',
  turno_manana_fin time not null default '14:00',
  turno_tarde_inicio time not null default '14:00',
  turno_tarde_fin time not null default '22:00',
  habilita_cierre_x boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.config_turnos_caja enable row level security;

create policy "config_turnos_caja_lectura_staff" on public.config_turnos_caja
  for select using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));

create policy "config_turnos_caja_escritura_superadmin" on public.config_turnos_caja
  for insert with check (public.rol_actual() = 'superadmin');

create policy "config_turnos_caja_actualizacion_superadmin" on public.config_turnos_caja
  for update using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

alter table public.notificaciones drop constraint if exists notificaciones_tipo_check;

alter table public.notificaciones
  add constraint notificaciones_tipo_check
  check (tipo in (
    'stock_bajo', 'cambio_precio', 'venta_registrada', 'faltante_reportado',
    'fichaje', 'cierre_x', 'cierre_z'
  ));
