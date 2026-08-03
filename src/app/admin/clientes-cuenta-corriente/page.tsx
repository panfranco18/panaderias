import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoClienteForm } from "./nuevo-cliente-form";
import { ClientesList } from "./clientes-list";

export default async function ClientesCuentaCorrientePage() {
  const supabase = createAdminClient();

  const [{ data: clientes, error }, { data: movimientos }] = await Promise.all([
    supabase.from("clientes_cuenta_corriente").select("*").order("nombre"),
    supabase
      .from("clientes_cuenta_corriente_movimientos")
      .select("*")
      .order("fecha", { ascending: false }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Clientes con cuenta corriente
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Clientes que retiran mercadería y pagan después (colegios,
        instituciones, otros comercios).
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="max-w-lg">
          <NuevoClienteForm />
        </div>
        <div className="max-w-lg">
          <ClientesList clientes={clientes ?? []} movimientos={movimientos ?? []} />
        </div>
      </div>
    </div>
  );
}
