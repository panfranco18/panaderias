import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoContratoForm } from "./nuevo-contrato-form";
import { ContratosList } from "./contratos-list";

export default async function ContratosPage() {
  const supabase = createAdminClient();

  const [{ data: contratos, error }, { data: sucursales }] = await Promise.all([
    supabase.from("contratos_alquiler").select("*").order("local"),
    supabase.from("sucursales").select("id, nombre").order("nombre"),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Contratos de alquiler
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Contratos de los locales: titular, inmobiliaria, vigencia y
        observaciones.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="max-w-lg">
          <NuevoContratoForm sucursales={sucursales ?? []} />
        </div>
        <div className="max-w-lg">
          <ContratosList contratos={contratos ?? []} sucursales={sucursales ?? []} />
        </div>
      </div>
    </div>
  );
}
