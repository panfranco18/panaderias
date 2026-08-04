import { createAdminClient } from "@/lib/supabase/admin";
import { HorariosFiltros } from "./horarios-filtros";
import { NuevoTurnoForm } from "./nuevo-turno-form";
import { TurnosList } from "./turnos-list";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function rangoPorPeriodo(periodo: string) {
  const hoy = new Date(`${hoyISO()}T00:00:00`);

  if (periodo === "semana") {
    const diaSemana = (hoy.getDay() + 6) % 7; // lunes = 0
    const inicio = new Date(hoy.getTime() - diaSemana * 86400000);
    const fin = new Date(inicio.getTime() + 7 * 86400000);
    return { desde: inicio.toISOString().slice(0, 10), hasta: fin.toISOString().slice(0, 10) };
  }

  if (periodo === "mes") {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    return { desde: inicio.toISOString().slice(0, 10), hasta: fin.toISOString().slice(0, 10) };
  }

  const fin = new Date(hoy.getTime() + 86400000);
  return { desde: hoyISO(), hasta: fin.toISOString().slice(0, 10) };
}

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo: periodoParam } = await searchParams;
  const periodo = periodoParam || "semana";
  const { desde, hasta } = rangoPorPeriodo(periodo);

  const supabase = createAdminClient();

  const [{ data: turnos }, { data: perfiles }, { data: sucursales }] = await Promise.all([
    supabase
      .from("turnos_personal")
      .select("id, perfil_id, sucursal_id, fecha, hora_inicio, hora_fin, notas")
      .gte("fecha", desde)
      .lt("fecha", hasta)
      .order("fecha"),
    supabase.from("perfiles").select("id, nombre").eq("activo", true).order("nombre"),
    supabase.from("sucursales").select("id, nombre").order("nombre"),
  ]);

  const empleados = perfiles ?? [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Horarios
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Quién trabaja y en qué horario, por sucursal.
      </p>

      <div className="mt-4">
        <HorariosFiltros periodo={periodo} />
      </div>

      {!sucursales?.length || !empleados.length ? (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Primero necesitás sucursales y empleados con acceso al panel cargados.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          <NuevoTurnoForm empleados={empleados} sucursales={sucursales} />
          <TurnosList
            turnos={turnos ?? []}
            empleados={empleados}
            sucursales={sucursales}
          />
        </div>
      )}
    </div>
  );
}
