import { createAdminClient } from "@/lib/supabase/admin";
import { VentaBuilder } from "./venta-builder";

export default async function VenderPage({
  searchParams,
}: {
  searchParams: Promise<{ sucursal?: string }>;
}) {
  const { sucursal: sucursalParam } = await searchParams;
  const supabase = createAdminClient();

  const [{ data: sucursales }, productosResult, { data: precios }] =
    await Promise.all([
      supabase.from("sucursales").select("id, nombre").order("nombre"),
      supabase
        .from("productos")
        .select("id, nombre, categoria, precio_base, codigo_barras, unidad_medida")
        .eq("activo", true)
        .order("nombre"),
      supabase.from("productos_precios_sucursal").select("*"),
    ]);

  // codigo_barras / unidad_medida todavía pueden no existir si no se corrieron
  // supabase/002_codigo_barras.sql y supabase/003_unidad_medida.sql
  let productos = productosResult.data;
  if (productosResult.error) {
    const fallback = await supabase
      .from("productos")
      .select("id, nombre, categoria, precio_base")
      .eq("activo", true)
      .order("nombre");
    productos = (fallback.data ?? []).map((p) => ({
      ...p,
      codigo_barras: null,
      unidad_medida: "unidad",
    }));
  }

  const sucursalId = sucursalParam || sucursales?.[0]?.id;

  return (
    <div className="p-8">
      <div className="no-print">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Vender
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Cobrá una venta en el momento: sumá productos, elegí el medio de
          pago e imprimí el ticket.
        </p>
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
        <VentaBuilder
          sucursales={sucursales}
          sucursalIdInicial={sucursalId!}
          productos={productos}
          precios={precios ?? []}
        />
      )}
    </div>
  );
}
