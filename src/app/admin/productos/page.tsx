import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoProductoForm } from "./nuevo-producto-form";
import { ProductosList } from "./productos-list";

export default async function ProductosPage() {
  const supabase = createAdminClient();

  const [{ data: productos, error }, { data: sucursales }, { data: precios }] =
    await Promise.all([
      supabase.from("productos").select("*").order("created_at"),
      supabase.from("sucursales").select("id, nombre").order("nombre"),
      supabase.from("productos_precios_sucursal").select("*"),
    ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Productos
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Panes, facturas, tortas, sandwiches y demás — con imagen y precio por
        sucursal.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6 max-w-lg">
        <NuevoProductoForm />
      </div>

      <div className="mt-8">
        <ProductosList
          productos={productos ?? []}
          sucursales={sucursales ?? []}
          precios={precios ?? []}
        />
      </div>
    </div>
  );
}
