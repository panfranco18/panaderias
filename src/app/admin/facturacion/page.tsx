import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { FacturacionFiltros } from "./facturacion-filtros";
import { ComprobantesList } from "./comprobantes-list";
import { hoyISO, rangoDiaAR } from "@/lib/fecha-ar";
import { TIPO_COMPROBANTE_LABEL, TIPO_COMPROBANTE_DESCRIPCION, type TipoComprobante } from "@/lib/comprobantes";

const TIPOS: TipoComprobante[] = ["factura_a", "factura_b", "remito", "presupuesto"];

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

  const { inicio, fin } = rangoDiaAR(fecha);

  const { data: comprobantes, error: comprobantesError } = sucursalId
    ? await supabase
        .from("comprobantes")
        .select("id, tipo, punto_venta, numero, cliente_nombre, total, fecha")
        .eq("sucursal_id", sucursalId)
        .gte("fecha", inicio)
        .lt("fecha", fin)
        .order("fecha", { ascending: false })
    : { data: [] as never[], error: null };

  const totalFacturado = (comprobantes ?? [])
    .filter((c) => c.tipo === "factura_a" || c.tipo === "factura_b")
    .reduce((acc, c) => acc + Number(c.total), 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Facturación
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Facturas, remitos y presupuestos por sucursal. No están conectados a
        AFIP (sin CAE) — sirven como comprobante interno prolijo.
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
          {comprobantesError && (
            <p className="mt-4 max-w-lg rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {comprobantesError.message.includes("comprobantes")
                ? "Todavía no se corrió la migración supabase/021_comprobantes.sql."
                : comprobantesError.message}
            </p>
          )}

          <div className="mt-6 max-w-md rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Total facturado ese día (Factura A + B)
            </p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              ${totalFacturado.toFixed(2)}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TIPOS.map((tipo) => (
              <Link
                key={tipo}
                href={`/admin/facturacion/nuevo?tipo=${tipo}${sucursalId ? `&sucursal=${sucursalId}` : ""}`}
                className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-amber-400 hover:bg-amber-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-700 dark:hover:bg-amber-950"
              >
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                  + {TIPO_COMPROBANTE_LABEL[tipo]}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {TIPO_COMPROBANTE_DESCRIPCION[tipo]}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <ComprobantesList comprobantes={comprobantes ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
