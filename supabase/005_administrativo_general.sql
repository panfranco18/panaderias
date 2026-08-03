-- =========================================================
-- Administrativo General: empleados (RRHH), gastos fijos,
-- contratos de alquiler y clientes con cuenta corriente.
-- =========================================================

-- ---------------------------------------------------------
-- Empleados (roster de RRHH — independiente de "perfiles",
-- que son las cuentas con acceso al panel admin)
-- ---------------------------------------------------------
create table if not exists public.empleados (
  id uuid primary key default gen_random_uuid(),
  apellido text,
  nombre text not null,
  dni text,
  domicilio text,
  fecha_nacimiento date,
  fecha_alta date,
  mes_vacaciones text,
  obra_social text,
  responsable text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_empleados_updated_at
  before update on public.empleados
  for each row execute function public.set_updated_at();

create table if not exists public.empleados_inasistencias (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references public.empleados(id) on delete cascade,
  fecha date not null default current_date,
  justificada boolean not null default false,
  observacion text,
  certificado text,
  art boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.empleados_art (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references public.empleados(id) on delete cascade,
  fecha date not null default current_date,
  fecha_baja date,
  informacion text,
  fecha_alta date,
  created_at timestamptz not null default now()
);

create table if not exists public.empleados_ropa (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references public.empleados(id) on delete cascade,
  fecha date not null default current_date,
  detalle text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Gastos fijos (alquileres, impuestos, sueldos, seguros, etc.)
-- ---------------------------------------------------------
create table if not exists public.gastos (
  id uuid primary key default gen_random_uuid(),
  categoria text not null, -- ej: "ALQUILER FELICE", "ARCA", "SUELDOS 1"...
  fecha date,
  detalle text,
  monto numeric(12,2),
  vencimiento date,
  fecha_pago date,
  otros text,
  created_at timestamptz not null default now()
);

create index if not exists idx_gastos_categoria on public.gastos(categoria);

-- ---------------------------------------------------------
-- Contratos de alquiler de los locales
-- ---------------------------------------------------------
create table if not exists public.contratos_alquiler (
  id uuid primary key default gen_random_uuid(),
  local text not null,
  sucursal_id uuid references public.sucursales(id) on delete set null,
  fecha_inicio date,
  fecha_fin date,
  aumentos text,
  arreglos text,
  observaciones text,
  titular text,
  inmobiliaria text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_contratos_alquiler_updated_at
  before update on public.contratos_alquiler
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- Clientes con cuenta corriente (retiran mercadería y pagan después)
-- ---------------------------------------------------------
create table if not exists public.clientes_cuenta_corriente (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cuit text,
  domicilio_fiscal text,
  responsable_iva text, -- ej: EXENTO, RESP.INS
  responsable_contacto text,
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_clientes_cc_updated_at
  before update on public.clientes_cuenta_corriente
  for each row execute function public.set_updated_at();

create table if not exists public.clientes_cuenta_corriente_movimientos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes_cuenta_corriente(id) on delete cascade,
  fecha date not null default current_date,
  detalle text,
  monto_retiro numeric(12,2) not null default 0,
  monto_pago numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- RLS — todo esto es información sensible (RRHH y finanzas),
-- solo el superadmin puede leer/escribir.
-- =========================================================
alter table public.empleados enable row level security;
alter table public.empleados_inasistencias enable row level security;
alter table public.empleados_art enable row level security;
alter table public.empleados_ropa enable row level security;
alter table public.gastos enable row level security;
alter table public.contratos_alquiler enable row level security;
alter table public.clientes_cuenta_corriente enable row level security;
alter table public.clientes_cuenta_corriente_movimientos enable row level security;

create policy "empleados_superadmin" on public.empleados
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

create policy "empleados_inasistencias_superadmin" on public.empleados_inasistencias
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

create policy "empleados_art_superadmin" on public.empleados_art
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

create policy "empleados_ropa_superadmin" on public.empleados_ropa
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

create policy "gastos_superadmin" on public.gastos
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

create policy "contratos_alquiler_superadmin" on public.contratos_alquiler
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

create policy "clientes_cc_superadmin" on public.clientes_cuenta_corriente
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

create policy "clientes_cc_movimientos_superadmin" on public.clientes_cuenta_corriente_movimientos
  for all using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

-- =========================================================
-- Datos reales (de las planillas ADMINISTRATIVO-GRAL.xlsx y
-- LISTADO EMPLEADOS.xlsx que pasó el usuario 2026-08-03)
-- =========================================================

insert into public.empleados (apellido, nombre, dni, domicilio, fecha_alta, mes_vacaciones, fecha_nacimiento, obra_social, responsable) values
  ('CORNEJO', 'ANA', null, null, null, null, null, 'NO TIENE', 'ROMERO'),
  ('GONZALEZ', 'DIEGO', null, null, null, null, null, 'NO TIENE', 'ROMERO'),
  ('LIJAN', 'JORGE', null, 'UNANUE 576', '2024-01-02', null, '1977-07-25', 'SANCOR', 'ROMERO'),
  ('LOPEZ', 'GISEL', null, null, null, null, null, 'NO TIENE', 'ROMERO'),
  ('LUJAN', 'BRAIAN', '20-43614121-2', 'TELEN 2224', null, 'ENERO', null, 'SANCOR', 'ROMERO'),
  ('LUJAN', 'J-EZEQUIEL', '20-42915541-0', 'CONSTITUYENTES', '2022-01-02', 'ENERO', null, 'SANCOR', 'ROMERO'),
  ('LUJAN', 'JUAN', null, null, null, null, null, 'SANCOR', 'ROMERO'),
  ('NICOLA', 'BRUNO', '20-46320462-5', 'GUATRACHE 2244', null, 'ENERO', '2005-02-24', 'SANCOR', 'ROMERO'),
  ('ROJAS', 'YASMIN', null, null, null, null, null, null, null),
  ('MARTINEZ VIOLETA', 'VIOLETA', null, null, null, null, null, null, null),
  ('FERNANDEZ', 'VANESA', null, null, null, null, null, null, null),
  ('SOSA', 'CAMILA', null, null, null, null, null, null, 'LUJAN JORG'),
  ('AGUIRRE', 'SOFIA', null, null, null, null, null, null, null),
  (null, 'LEANDRO', null, null, null, null, null, null, null),
  ('AGUIRRE', 'JONATHAN', null, null, null, null, null, 'NO TIENE', 'ROMERO');

insert into public.contratos_alquiler (local, titular, inmobiliaria) values
  ('FELICE', 'ALY', 'MARIELA GARAV'),
  ('13 DE CABALLERIA', 'ALY', 'HEIT'),
  ('PERON8450', 'ALY', 'HEIT'),
  ('YRIGOYEN 190', 'JORGE', 'NEG INM');

insert into public.clientes_cuenta_corriente (nombre, responsable_iva, responsable_contacto) values
  ('REGIMIENTO TOAY', 'EXENTO', 'LUSCONTI'),
  ('REGIMIENTO STA ROSA', 'EXENTO', 'LUSCONTI'),
  ('DOMINGO SAVIO', 'EXENTO', null),
  ('JARDIN BOTANICO', 'RESP INS', null),
  ('ESCUELA CACHIRULO', 'EXENTO', 'VERONICA'),
  ('CREAR', 'EXENTO', null),
  ('ESCUELA PARA ADULTOS', 'EXENTO', 'PATRICIA ZINC'),
  ('PANAD SENTIR DE CAMPO', 'RESP.INS', null),
  ('PANAD URUGUAY', 'RESP.INS', null),
  ('LA TOSCANA', null, null);
