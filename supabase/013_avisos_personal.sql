-- Avisos del superadmin al personal: saludo o recordatorio del día,
-- general (perfil_id null) o dirigido a un empleado puntual.

create table if not exists public.avisos_personal (
  id uuid primary key default gen_random_uuid(),
  mensaje text not null,
  perfil_id uuid references public.perfiles(id) on delete cascade,
  fecha date not null default current_date,
  creado_por uuid references public.perfiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_avisos_personal_fecha on public.avisos_personal(fecha);
create index if not exists idx_avisos_personal_perfil on public.avisos_personal(perfil_id);

alter table public.avisos_personal enable row level security;

create policy "avisos_personal_lectura_staff" on public.avisos_personal
  for select using (public.rol_actual() in ('superadmin', 'encargado_sucursal', 'empleado'));

create policy "avisos_personal_escritura_superadmin" on public.avisos_personal
  for insert with check (public.rol_actual() = 'superadmin');

create policy "avisos_personal_borrado_superadmin" on public.avisos_personal
  for delete using (public.rol_actual() = 'superadmin');
