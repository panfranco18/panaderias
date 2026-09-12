import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { esTipoComprobante, type TipoComprobante } from "@/lib/comprobantes";

const TITULO_NUEVO: Record<TipoComprobante, string> = {
  factura_a: "Nueva Factura A",
  factura_b: "Nueva Factura B",
  remito: "Nuevo Remito",
  presupuesto: "Nuevo Presupuesto",
};
import { ComprobanteForm } from "./comprobante-form";

export default async function NuevoComprobantePage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; sucursal?: string }>;
}) {
  const { tipo: tipoParam, sucursal: sucursalParam } = await searchParams;

  if (!tipoParam || !esTipoComprobante(tipoParam)) {
    redirect("/admin/facturacion");
  }

  const supabase = createAdminClient();
  const { data: sucursales } = await supabase
    .from("sucursales")
    .select("id, nombre")
    .order("nombre");

  const sucursalId = sucursalParam || sucursales?.[0]?.id;

  if (!sucursales?.length || !sucursalId) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Primero cargá una sucursal en el módulo <b>Sucursales</b>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {TITULO_NUEVO[tipoParam]}
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {tipoParam === "factura_a" &&
          "Discrimina el IVA. Necesita el CUIT del cliente (Responsable Inscripto)."}
        {tipoParam === "factura_b" &&
          "Precio final, sin discriminar IVA. Para consumidor final o monotributista."}
        {tipoParam === "remito" &&
          "Detalle de la mercadería entregada, sin valor fiscal."}
        {tipoParam === "presupuesto" &&
          "Cotización para el cliente. Todavía no es una venta."}
      </p>

      <div className="mt-6 max-w-2xl">
        <ComprobanteForm
          tipo={tipoParam}
          sucursales={sucursales}
          sucursalIdInicial={sucursalId}
        />
      </div>
    </div>
  );
}
