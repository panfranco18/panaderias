"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRolEnSucursal } from "@/lib/auth/current-perfil";
import { esTipoComprobante, calcularIva, type TipoComprobante } from "@/lib/comprobantes";

export type ActionState = { error?: string; ok?: boolean };

const STAFF = ["superadmin", "encargado_sucursal", "empleado"] as const;

export type ItemEncontrado = {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
};

export type VentaEncontrada = {
  ventaId: string;
  total: number;
  fecha: string;
  metodoPago: string | null;
  items: ItemEncontrado[];
};

export async function buscarVentaPorTicket(
  sucursalId: string,
  numeroTicket: number
): Promise<{ error: string } | { ok: true; venta: VentaEncontrada }> {
  const auth = await requireRolEnSucursal([...STAFF], sucursalId);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();

  const { data: venta, error } = await supabase
    .from("ventas")
    .select("id, total, fecha, metodo_pago")
    .eq("sucursal_id", sucursalId)
    .eq("numero_ticket", numeroTicket)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!venta) return { error: `No se encontró ningún ticket N° ${numeroTicket} en esta sucursal.` };

  const { data: items } = await supabase
    .from("items_venta")
    .select("producto_id, cantidad, precio_unitario")
    .eq("venta_id", venta.id);

  const productoIds = (items ?? []).map((it) => it.producto_id).filter((id): id is string => !!id);
  const { data: productos } = productoIds.length
    ? await supabase.from("productos").select("id, nombre").in("id", productoIds)
    : { data: [] as { id: string; nombre: string }[] };
  const nombrePorId = new Map((productos ?? []).map((p) => [p.id, p.nombre]));

  const itemsFormateados: ItemEncontrado[] = (items ?? []).map((it) => ({
    descripcion: (it.producto_id && nombrePorId.get(it.producto_id)) || "Producto",
    cantidad: Number(it.cantidad),
    precioUnitario: Number(it.precio_unitario),
  }));

  return {
    ok: true,
    venta: {
      ventaId: venta.id,
      total: Number(venta.total),
      fecha: venta.fecha,
      metodoPago: venta.metodo_pago,
      items: itemsFormateados.length > 0
        ? itemsFormateados
        : [{ descripcion: "Venta (ticket sin detalle de productos)", cantidad: 1, precioUnitario: Number(venta.total) }],
    },
  };
}

export type ItemComprobanteInput = {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
};

export type CrearComprobanteInput = {
  sucursalId: string;
  tipo: TipoComprobante;
  ventaId?: string | null;
  clienteNombre?: string;
  clienteCuit?: string;
  clienteDomicilio?: string;
  clienteCondicionIva?: string;
  porcentajeIva?: number;
  observaciones?: string;
  items: ItemComprobanteInput[];
};

export async function crearComprobante(
  input: CrearComprobanteInput
): Promise<{ error: string } | { ok: true; id: string }> {
  if (!input.sucursalId) return { error: "Falta la sucursal" };
  if (!esTipoComprobante(input.tipo)) return { error: "Tipo de comprobante inválido" };
  if (!input.items?.length) return { error: "Agregá al menos un ítem" };
  if (input.tipo === "factura_a" && !input.clienteCuit?.trim()) {
    return { error: "La Factura A necesita el CUIT del cliente" };
  }

  const auth = await requireRolEnSucursal([...STAFF], input.sucursalId);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();

  const { data: sucursal, error: sucursalError } = await supabase
    .from("sucursales")
    .select("punto_venta")
    .eq("id", input.sucursalId)
    .single();
  if (sucursalError || !sucursal) return { error: sucursalError?.message ?? "Sucursal no encontrada" };

  const puntoVenta = sucursal.punto_venta || "0001";

  const total = input.items.reduce((a, it) => a + it.cantidad * it.precioUnitario, 0);
  const porcentajeIva = input.porcentajeIva ?? 21;

  let subtotal = total;
  let iva = 0;
  if (input.tipo === "factura_a") {
    const calculo = calcularIva(total, porcentajeIva);
    subtotal = calculo.subtotal;
    iva = calculo.iva;
  }

  const { data: numeroData, error: numeroError } = await supabase.rpc(
    "siguiente_numero_comprobante",
    { p_tipo: input.tipo, p_punto_venta: puntoVenta }
  );
  if (numeroError || numeroData == null) {
    return { error: numeroError?.message ?? "No se pudo generar el número de comprobante" };
  }

  const { data: comprobante, error: comprobanteError } = await supabase
    .from("comprobantes")
    .insert({
      sucursal_id: input.sucursalId,
      tipo: input.tipo,
      punto_venta: puntoVenta,
      numero: numeroData,
      venta_id: input.ventaId || null,
      cliente_nombre: input.clienteNombre?.trim() || null,
      cliente_cuit: input.clienteCuit?.trim() || null,
      cliente_domicilio: input.clienteDomicilio?.trim() || null,
      cliente_condicion_iva: input.clienteCondicionIva?.trim() || null,
      porcentaje_iva: porcentajeIva,
      subtotal,
      iva,
      total,
      observaciones: input.observaciones?.trim() || null,
      perfil_id: auth.perfil.id,
    })
    .select("id")
    .single();

  if (comprobanteError || !comprobante) {
    return { error: comprobanteError?.message ?? "No se pudo crear el comprobante" };
  }

  const itemsPayload = input.items.map((it, i) => ({
    comprobante_id: comprobante.id,
    orden: i,
    descripcion: it.descripcion,
    cantidad: it.cantidad,
    precio_unitario: it.precioUnitario,
  }));

  const { error: itemsError } = await supabase.from("comprobante_items").insert(itemsPayload);
  if (itemsError) return { error: itemsError.message };

  revalidatePath("/admin/facturacion");
  return { ok: true, id: comprobante.id };
}

export async function eliminarComprobante(id: string): Promise<ActionState> {
  const supabase = createAdminClient();

  const { data: comprobante } = await supabase
    .from("comprobantes")
    .select("sucursal_id")
    .eq("id", id)
    .maybeSingle();

  const auth = await requireRolEnSucursal([...STAFF], comprobante?.sucursal_id ?? null);
  if ("error" in auth) return auth;

  const { error } = await supabase.from("comprobantes").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/facturacion");
  return { ok: true };
}
