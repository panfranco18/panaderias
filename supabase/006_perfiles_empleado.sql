-- Vincula las cuentas con acceso al panel (perfiles) con el legajo de
-- RRHH (empleados), para poder darle acceso a un empleado ya cargado
-- en vez de crear una cuenta desde cero.

alter table public.perfiles
  add column if not exists empleado_id uuid references public.empleados(id) on delete set null;

create unique index if not exists idx_perfiles_empleado_id_unique
  on public.perfiles(empleado_id)
  where empleado_id is not null;
