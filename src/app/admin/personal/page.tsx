import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoEmpleadoForm } from "./nuevo-empleado-form";
import { PersonalList } from "./personal-list";

export default async function PersonalPage() {
  const supabase = createAdminClient();

  const [{ data: perfiles, error }, { data: empleadosRoster }, { data: sucursales }] =
    await Promise.all([
      supabase
        .from("perfiles")
        .select("id, nombre, cargo, rol, sucursal_id, nivel_acceso, activo, empleado_id")
        .order("nombre"),
      supabase
        .from("empleados")
        .select("id, nombre, apellido")
        .eq("activo", true)
        .order("apellido"),
      supabase.from("sucursales").select("id, nombre").order("nombre"),
    ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Personal
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Dale acceso al panel a los empleados del legajo, con cargo, sucursal
        y nivel de acceso. Solo el superadmin asigna niveles de acceso.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6">
        <PersonalList
          perfiles={perfiles ?? []}
          empleadosRoster={empleadosRoster ?? []}
          sucursales={sucursales ?? []}
        />
      </div>

      <div className="mt-8 max-w-lg">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Crear cuenta sin vincular a un empleado del legajo
        </h3>
        <NuevoEmpleadoForm sucursales={sucursales ?? []} />
      </div>
    </div>
  );
}
