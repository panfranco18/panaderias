import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoProductoForm } from "./nuevo-producto-form";
import { ProductosCategorias } from "./productos-categorias";

export default async function ProductosPage() {
  const supabase = createAdminClient();

  const [{ data: productos, error }, { data: sucursales }, { data: precios }, { data: categoriasConfig }] =
    await Promise.all([
      supabase.from("productos").select("*").order("created_at"),
      supabase.from("sucursales").select("id, nombre").order("nombre"),
      supabase.from("productos_precios_sucursal").select("*"),
      supabase.from("categorias_config").select("categoria, imagen_url").order("categoria"),
    ]);

  const nombresCategorias = (categoriasConfig ?? []).map((c) => c.categoria);
  const imagenPorCategoria: Record<string, string | null> = {};
  for (const c of categoriasConfig ?? []) {
    imagenPorCategoria[c.categoria] = c.imagen_url;
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Productos
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Panes, facturas, tortas, sandwiches y demás — con imagen y precio
            por sucursal.
          </p>
        </div>
        <Link
          href="/admin/categorias"
          className="shrink-0 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Gestionar categorías
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6 max-w-lg">
        <NuevoProductoForm categorias={nombresCategorias} />
      </div>

      <div className="mt-8">
        <ProductosCategorias
          productos={productos ?? []}
          sucursales={sucursales ?? []}
          precios={precios ?? []}
          categorias={nombresCategorias}
          imagenPorCategoria={imagenPorCategoria}
        />
      </div>
    </div>
  );
}
