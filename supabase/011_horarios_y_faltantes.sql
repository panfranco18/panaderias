-- Horarios asignados al personal (turnos), y reporte manual de
-- faltantes de stock por sucursal.

create table if not exists public.turnos_personal (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  sucursal_id uuid not null references public.sucursales(id) on delete cascade,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists idx_turnos_fecha on public.turnos_personal(fecha);
create index if not exists idx_turnos_sucursal on public.turnos_personal(sucursal_id);
create index if not exists idx_turnos_perfil on public.turnos_personal(perfil_id);

alter table public.turnos_personal enable row level security;

-- Cualquier miembro del staff puede VER los horarios (para saber quién
-- trabaja cuándo); solo superadmin/encargado los carga o edita.
create policy "turnos_lectura_staff" on public.turnos_personal
  for select using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));

create policy "turnos_escritura_superadmin_encargado" on public.turnos_personal
  for insert with check (public.rol_actual() in ('superadmin', 'encargado_sucursal'));

create policy "turnos_actualizacion_superadmin_encargado" on public.turnos_personal
  for update using (public.rol_actual() in ('superadmin', 'encargado_sucursal'))
  with check (public.rol_actual() in ('superadmin', 'encargado_sucursal'));

create policy "turnos_borrado_superadmin_encargado" on public.turnos_personal
  for delete using (public.rol_actual() in ('superadmin', 'encargado_sucursal'));

-- Categorías: permitir o no que los empleados reporten faltantes en esa categoría
alter table public.categorias_config
  add column if not exists permite_reportar_faltante boolean not null default true;

-- Notificaciones: nuevo tipo para faltantes reportados a mano por el personal
alter table public.notificaciones drop constraint if exists notificaciones_tipo_check;

alter table public.notificaciones
  add constraint notificaciones_tipo_check
  check (tipo in ('stock_bajo', 'cambio_precio', 'venta_registrada', 'faltante_reportado'));
