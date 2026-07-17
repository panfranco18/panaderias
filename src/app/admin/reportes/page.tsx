import { createAdminClient } from "@/lib/supabase/admin";
import { ReportesFiltros } from "./reportes-filtros";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function inicioPorPeriodo(periodo: string) {
  const hoy = new Date(`${hoyISO()}T00:00:00`);
  const dias = periodo === "mes" ? 29 : periodo === "semana" ? 6 : 0;
  const inicio = new Date(hoy.getTime() - dias * 86400000);
  return inicio.toISOString();
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ sucursal?: string; periodo?: string }>;
}) {
  const { sucursal: sucursalParam, periodo: periodoParam } = await searchParams;
  const periodo = periodoParam || "dia";
  const supabase = createAdminClient();

  const { data: sucursales } = await supabase
    .from("sucursales")
    .select("id, nombre")
    .order("nombre");

  const sucursalId = sucursalParam || sucursales?.[0]?.id;

  const inicio = inicioPorPeriodo(periodo);
  const fin = new Date(new Date(`${hoyISO()}T00:00:00`).getTime() + 86400000).toISOString();

  const { data: ventas } = sucursalId
    ? await supabase
        .from("ventas")
        .select("id, total, fecha, origen")
        .eq("sucursal_id", sucursalId)
        .gte("fecha", inicio)
        .lt("fecha", fin)
    : { data: [] as { id: string; total: number; fecha: string; origen: string }[] };

  const ventaIds = (ventas ?? []).map((v) => v.id);

  const { data: items } = ventaIds.length
    ? await supabase
        .from("items_venta")
        .select("producto_id, cantidad, subtotal")
        .in("venta_id", ventaIds)
    : { data: [] as { producto_id: string | null; cantidad: number; subtotal: number }[] };

  const { data: productos } = await supabase
    .from("productos")
    .select("id, nombre");

  const nombreProducto = (id: string | null) =>
    productos?.find((p) => p.id === id)?.nombre ?? "Producto eliminado";

  const totalVendido = (ventas ?? []).reduce((a, v) => a + Number(v.total), 0);
  const cantidadVentas = (ventas ?? []).length;
  const ticketPromedio = cantidadVentas > 0 ? totalVendido / cantidadVentas : 0;

  const porProducto = new Map<string, { cantidad: number; monto: number }>();
  for (const it of items ?? []) {
    const key = it.producto_id ?? "sin-producto";
    const actual = porProducto.get(key) ?? { cantidad: 0, monto: 0 };
    actual.cantidad += Number(it.cantidad);
    actual.monto += Number(it.subtotal);
    porProducto.set(key, actual);
  }

  const rankingProductos = Array.from(porProducto.entries())
    .map(([productoId, datos]) => ({
      productoId,
      nombre: nombreProducto(productoId === "sin-producto" ? null : productoId),
      ...datos,
    }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 10);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Reportes
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Estadísticas de ventas por sucursal.
      </p>

      <div className="mt-4">
        <ReportesFiltros
          sucursales={sucursales ?? []}
          sucursalId={sucursalId}
          periodo={periodo}
        />
      </div>

      {!sucursales?.length ? (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Primero cargá una sucursal en el módulo <b>Sucursales</b>.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Total vendido
              </p>
              <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                ${totalVendido.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Cantidad de ventas
              </p>
              <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {cantidadVentas}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Ticket promedio
              </p>
              <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                ${ticketPromedio.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Productos más vendidos
            </p>
            {rankingProductos.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Sin ventas en este período.
              </p>
            ) : (
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                    <th className="pb-2">Producto</th>
                    <th className="pb-2 text-right">Cantidad</th>
                    <th className="pb-2 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingProductos.map((p) => (
                    <tr
                      key={p.productoId}
                      className="border-t border-zinc-100 dark:border-zinc-800"
                    >
                      <td className="py-1.5 text-zinc-800 dark:text-zinc-200">
                        {p.nombre}
                      </td>
                      <td className="py-1.5 text-right text-zinc-600 dark:text-zinc-400">
                        {p.cantidad}
                      </td>
                      <td className="py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-50">
                        ${p.monto.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
