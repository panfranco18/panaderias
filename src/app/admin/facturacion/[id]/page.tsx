import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ComprobanteView } from "./comprobante-view";
import { esTipoComprobante } from "@/lib/comprobantes";

export default async function ComprobantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: comprobante } = await supabase
    .from("comprobantes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!comprobante || !esTipoComprobante(comprobante.tipo)) {
    notFound();
  }

  const [{ data: items }, { data: sucursal }, { data: config }] = await Promise.all([
    supabase
      .from("comprobante_items")
      .select("*")
      .eq("comprobante_id", id)
      .order("orden"),
    supabase
      .from("sucursales")
      .select("nombre, direccion, telefono, punto_venta")
      .eq("id", comprobante.sucursal_id)
      .maybeSingle(),
    supabase
      .from("configuracion_negocio")
      .select("razon_social, cuit, condicion_iva, ingresos_brutos, inicio_actividades")
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <ComprobanteView
      comprobante={{
        id: comprobante.id,
        tipo: comprobante.tipo,
        puntoVenta: comprobante.punto_venta,
        numero: Number(comprobante.numero),
        fecha: comprobante.fecha,
        clienteNombre: comprobante.cliente_nombre,
        clienteCuit: comprobante.cliente_cuit,
        clienteDomicilio: comprobante.cliente_domicilio,
        clienteCondicionIva: comprobante.cliente_condicion_iva,
        porcentajeIva: Number(comprobante.porcentaje_iva),
        subtotal: Number(comprobante.subtotal),
        iva: Number(comprobante.iva),
        total: Number(comprobante.total),
        observaciones: comprobante.observaciones,
      }}
      items={(items ?? []).map((it) => ({
        id: it.id,
        descripcion: it.descripcion,
        cantidad: Number(it.cantidad),
        precioUnitario: Number(it.precio_unitario),
        subtotal: Number(it.subtotal),
      }))}
      sucursal={{
        nombre: sucursal?.nombre ?? "",
        direccion: sucursal?.direccion ?? null,
        telefono: sucursal?.telefono ?? null,
        puntoVenta: sucursal?.punto_venta ?? comprobante.punto_venta,
      }}
      negocio={{
        razonSocial: config?.razon_social ?? null,
        cuit: config?.cuit ?? null,
        condicionIva: config?.condicion_iva ?? null,
        ingresosBrutos: config?.ingresos_brutos ?? null,
        inicioActividades: config?.inicio_actividades ?? null,
      }}
    />
  );
}
