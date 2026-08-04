import { createAdminClient } from "@/lib/supabase/admin";
import { SucursalSelector } from "./sucursal-selector";
import { StockCategorias } from "./stock-categorias";

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ sucursal?: string }>;
}) {
  const { sucursal: sucursalParam } = await searchParams;
  const supabase = createAdminClient();

  const { data: sucursales } = await supabase
    .from("sucursales")
    .select("id, nombre")
    .order("nombre");

  const sucursalId = sucursalParam || sucursales?.[0]?.id;

  const [{ data: productos }, { data: stockRows }, { data: categoriasConfig }] =
    await Promise.all([
      supabase
        .from("productos")
        .select("id, nombre, categoria")
        .eq("activo", true)
        .order("nombre"),
      sucursalId
        ? supabase.from("stock").select("*").eq("sucursal_id", sucursalId)
        : Promise.resolve({ data: [] as never[] }),
      supabase.from("categorias_config").select("categoria, imagen_url"),
    ]);

  const imagenPorCategoria: Record<string, string | null> = {};
  for (const c of categoriasConfig ?? []) {
    imagenPorCategoria[c.categoria] = c.imagen_url;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Stock
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Control de stock por producto y sucursal.
      </p>

      <div className="mt-4">
        <SucursalSelector sucursales={sucursales ?? []} actual={sucursalId} />
      </div>

      {!sucursales?.length ? (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Primero cargá una sucursal en el módulo <b>Sucursales</b>.
        </p>
      ) : !productos?.length ? (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Primero cargá productos en el módulo <b>Productos</b>.
        </p>
      ) : (
        <div className="mt-6">
          <StockCategorias
            productos={productos}
            stock={stockRows ?? []}
            sucursalId={sucursalId!}
            imagenPorCategoria={imagenPorCategoria}
          />
        </div>
      )}
    </div>
  );
}
