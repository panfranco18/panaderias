"use server";

import { createClient } from "@/lib/supabase/server";

export type CheckoutItem = {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
};

export type CheckoutInput = {
  clienteNombre: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  sucursalId?: string | null;
  notas?: string;
  items: CheckoutItem[];
};

export type CheckoutResult = { ok?: boolean; error?: string };

export async function crearPedidoOnline(
  input: CheckoutInput
): Promise<CheckoutResult> {
  const nombre = input.clienteNombre.trim();
  if (!nombre) return { error: "Falta el nombre" };
  if (!input.items?.length) return { error: "El carrito está vacío" };

  const supabase = await createClient();
  const pedidoId = crypto.randomUUID();
  const total = input.items.reduce(
    (acc, it) => acc + it.cantidad * it.precioUnitario,
    0
  );

  const { error: pedidoError } = await supabase.from("pedidos").insert({
    id: pedidoId,
    cliente_nombre: nombre,
    cliente_telefono: input.clienteTelefono?.trim() || null,
    cliente_email: input.clienteEmail?.trim() || null,
    sucursal_id: input.sucursalId || null,
    tipo: "online",
    estado: "pendiente",
    notas: input.notas?.trim() || null,
    total,
  });

  if (pedidoError) return { error: pedidoError.message };

  const itemsPayload = input.items.map((it) => ({
    pedido_id: pedidoId,
    producto_id: it.productoId,
    cantidad: it.cantidad,
    precio_unitario: it.precioUnitario,
  }));

  const { error: itemsError } = await supabase
    .from("pedidos_items")
    .insert(itemsPayload);

  if (itemsError) return { error: itemsError.message };

  return { ok: true };
}
