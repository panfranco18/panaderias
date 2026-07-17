import { createAdminClient } from "@/lib/supabase/admin";
import { SucursalesList } from "./sucursales-list";
import { NuevaSucursalForm } from "./nueva-sucursal-form";

export default async function SucursalesPage() {
  const supabase = createAdminClient();

  const [{ data: sucursales, error: errorSucursales }, { data: empleados }] =
    await Promise.all([
      supabase.from("sucursales").select("*").order("created_at"),
      supabase
        .from("perfiles")
        .select("id, nombre, cargo, rol, sucursal_id")
        .order("nombre"),
    ]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sucursales
        </h1>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Alta de sucursales y su personal asignado.
      </p>

      {errorSucursales && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          No se pudo conectar con la tabla <code>sucursales</code>. ¿Ya
          ejecutaste el SQL de <code>supabase/001_schema.sql</code> en el
          proyecto Supabase? ({errorSucursales.message})
        </p>
      )}

      <div className="mt-6 max-w-md">
        <NuevaSucursalForm />
      </div>

      <div className="mt-8">
        <SucursalesList
          sucursales={sucursales ?? []}
          empleados={empleados ?? []}
        />
      </div>
    </div>
  );
}
