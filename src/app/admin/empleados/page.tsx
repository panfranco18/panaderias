import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoEmpleadoForm } from "./nuevo-empleado-form";
import { EmpleadosList } from "./empleados-list";

export default async function EmpleadosPage() {
  const supabase = createAdminClient();

  const { data: empleados, error } = await supabase
    .from("empleados")
    .select("*")
    .order("apellido");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Empleados
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Legajo de RRHH: datos personales, obra social y responsable a cargo.
        Es independiente de quién tiene acceso al panel (eso se gestiona en
        Personal).
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="max-w-lg">
          <NuevoEmpleadoForm />
        </div>
        <div className="max-w-lg">
          <EmpleadosList empleados={empleados ?? []} />
        </div>
      </div>
    </div>
  );
}
