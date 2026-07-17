import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoPedidoForm } from "./nuevo-pedido-form";
import { PedidosList } from "./pedidos-list";

export default async function PedidosPage() {
  const supabase = createAdminClient();

  const [{ data: pedidos, error }, { data: sucursales }, { data: productos }, { data: items }] =
    await Promise.all([
      supabase.from("pedidos").select("*").order("created_at", { ascending: false }),
      supabase.from("sucursales").select("id, nombre").order("nombre"),
      supabase
        .from("productos")
        .select("id, nombre, precio_base")
        .eq("activo", true)
        .order("nombre"),
      supabase.from("pedidos_items").select("*"),
    ]);

  return (
    <div className="p-8">
      <div className="no-print">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Pedidos
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Pedidos online (carrito del sitio) y consultas para fiestas y
          eventos.
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error.message}
          </p>
        )}

        <div className="mt-6 max-w-lg">
          <NuevoPedidoForm sucursales={sucursales ?? []} />
        </div>
      </div>

      <div className="mt-8">
        <PedidosList
          pedidos={pedidos ?? []}
          sucursales={sucursales ?? []}
          productos={productos ?? []}
          items={items ?? []}
        />
      </div>
    </div>
  );
}
