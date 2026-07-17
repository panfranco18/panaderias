"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol, type Rol } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

const STAFF: Rol[] = ["superadmin", "encargado_sucursal", "empleado"];

export async function crearPedido(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(STAFF);
  if ("error" in auth) return auth;

  const clienteNombre = String(formData.get("cliente_nombre") || "").trim();
  const clienteTelefono = String(formData.get("cliente_telefono") || "").trim() || null;
  const clienteEmail = String(formData.get("cliente_email") || "").trim() || null;
  const sucursalId = String(formData.get("sucursal_id") || "") || null;
  const tipo = String(formData.get("tipo") || "online");
  const notas = String(formData.get("notas") || "").trim() || null;
  const fechaEvento = String(formData.get("fecha_evento") || "") || null;

  if (!clienteNombre) return { error: "El nombre del cliente es obligatorio" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("pedidos").insert({
    cliente_nombre: clienteNombre,
    cliente_telefono: clienteTelefono,
    cliente_email: clienteEmail,
    sucursal_id: sucursalId,
    tipo,
    notas,
    fecha_evento: fechaEvento,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  return { ok: true };
}

export async function actualizarEstadoPedido(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(STAFF);
  if ("error" in auth) return auth;

  const estado = String(formData.get("estado") || "pendiente");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  return { ok: true };
}

export async function eliminarPedido(id: string): Promise<ActionState> {
  const auth = await requireRol(STAFF);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("pedidos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  return { ok: true };
}

async function recalcularTotal(
  supabase: ReturnType<typeof createAdminClient>,
  pedidoId: string
) {
  const { data: items } = await supabase
    .from("pedidos_items")
    .select("cantidad, precio_unitario")
    .eq("pedido_id", pedidoId);

  const total = (items ?? []).reduce(
    (acc, it) => acc + Number(it.cantidad) * Number(it.precio_unitario),
    0
  );

  await supabase.from("pedidos").update({ total }).eq("id", pedidoId);
}

export async function agregarItemPedido(
  pedidoId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(STAFF);
  if ("error" in auth) return auth;

  const productoId = String(formData.get("producto_id") || "");
  const cantidad = Number(formData.get("cantidad") || 0);

  if (!productoId) return { error: "Elegí un producto" };
  if (!cantidad || cantidad <= 0) return { error: "La cantidad debe ser mayor a 0" };

  const supabase = createAdminClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("precio_base")
    .eq("id", productoId)
    .single();

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("sucursal_id")
    .eq("id", pedidoId)
    .single();

  let precioUnitario = Number(producto?.precio_base ?? 0);

  if (pedido?.sucursal_id) {
    const { data: precioSucursal } = await supabase
      .from("productos_precios_sucursal")
      .select("precio")
      .eq("producto_id", productoId)
      .eq("sucursal_id", pedido.sucursal_id)
      .maybeSingle();
    if (precioSucursal) precioUnitario = Number(precioSucursal.precio);
  }

  const { error } = await supabase.from("pedidos_items").insert({
    pedido_id: pedidoId,
    producto_id: productoId,
    cantidad,
    precio_unitario: precioUnitario,
  });

  if (error) return { error: error.message };

  await recalcularTotal(supabase, pedidoId);

  revalidatePath("/admin/pedidos");
  return { ok: true };
}

export async function eliminarItemPedido(
  itemId: string,
  pedidoId: string
): Promise<ActionState> {
  const auth = await requireRol(STAFF);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("pedidos_items")
    .delete()
    .eq("id", itemId);
  if (error) return { error: error.message };

  await recalcularTotal(supabase, pedidoId);

  revalidatePath("/admin/pedidos");
  return { ok: true };
}
