import { createAdminClient } from "@/lib/supabase/admin";
import { FacturacionFiltros } from "./facturacion-filtros";
import { NuevaFacturaVentaForm } from "./nueva-factura-venta-form";
import { FacturasVentaList } from "./facturas-venta-list";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function FacturacionPage({
  searchParams,
}: {
  searchParams: Promise<{ sucursal?: string; fecha?: string }>;
}) {
  const { sucursal: sucursalParam, fecha: fechaParam } = await searchParams;
  const supabase = createAdminClient();

  const { data: sucursales } = await supabase
    .from("sucursales")
    .select("id, nombre")
    .order("nombre");

  const sucursalId = sucursalParam || sucursales?.[0]?.id;
  const fecha = fechaParam || hoyISO();

  const inicio = `${fecha}T00:00:00`;
  const fin = new Date(new Date(`${fecha}T00:00:00`).getTime() + 86400000).toISOString();

  const { data: facturas } = sucursalId
    ? await supabase
        .from("facturas_venta")
        .select("*, ventas!inner(sucursal_id)")
        .eq("ventas.sucursal_id", sucursalId)
        .gte("fecha", inicio)
        .lt("fecha", fin)
        .order("fecha", { ascending: false })
    : { data: [] as never[] };

  const total = (facturas ?? []).reduce((acc, f) => acc + Number(f.monto), 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Facturación
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Facturas de ventas del día, por sucursal.
      </p>

      <div className="mt-4">
        <FacturacionFiltros
          sucursales={sucursales ?? []}
          sucursalId={sucursalId}
          fecha={fecha}
        />
      </div>

      {!sucursales?.length ? (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Primero cargá una sucursal en el módulo <b>Sucursales</b>.
        </p>
      ) : (
        <>
          <div className="mt-6 max-w-md rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Total facturado ese día
            </p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              ${total.toFixed(2)}
            </p>
          </div>

          <div className="mt-6 max-w-lg">
            <NuevaFacturaVentaForm sucursalId={sucursalId!} fecha={fecha} />
          </div>

          <div className="mt-6">
            <FacturasVentaList facturas={facturas ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
