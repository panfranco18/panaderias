import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoGastoForm } from "./nuevo-gasto-form";
import { GastosList } from "./gastos-list";

export default async function GastosPage() {
  const supabase = createAdminClient();

  const { data: gastos, error } = await supabase
    .from("gastos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Gastos fijos
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Alquileres, impuestos, sueldos y demás gastos generales, con
        vencimiento y fecha de pago.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="max-w-lg">
          <NuevoGastoForm />
        </div>
        <div className="max-w-lg">
          <GastosList gastos={gastos ?? []} />
        </div>
      </div>
    </div>
  );
}
