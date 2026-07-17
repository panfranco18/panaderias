import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoEmpleadoForm } from "./nuevo-empleado-form";
import { PersonalList } from "./personal-list";

export default async function PersonalPage() {
  const supabase = createAdminClient();

  const [{ data: empleados, error }, { data: sucursales }] = await Promise.all([
    supabase
      .from("perfiles")
      .select("id, nombre, cargo, rol, sucursal_id, nivel_acceso, activo")
      .order("nombre"),
    supabase.from("sucursales").select("id, nombre").order("nombre"),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Personal
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Alta de empleados, cargo por sucursal y nivel de acceso al panel
        admin. Solo el superadmin asigna niveles de acceso.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6 max-w-lg">
        <NuevoEmpleadoForm sucursales={sucursales ?? []} />
      </div>

      <div className="mt-8">
        <PersonalList
          empleados={empleados ?? []}
          sucursales={sucursales ?? []}
        />
      </div>
    </div>
  );
}
