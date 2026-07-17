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
  tipoEntrega: "retiro" | "envio";
  direccionEntrega?: string;
  horaRetiro?: string;
  metodoPago: string;
  costoEnvio?: number;
};

export type CheckoutResult = { ok?: boolean; error?: string };

export async function crearPedidoOnline(
  input: CheckoutInput
): Promise<CheckoutResult> {
  const nombre = input.clienteNombre.trim();
  if (!nombre) return { error: "Falta el nombre" };
  if (!input.items?.length) return { error: "El carrito está vacío" };
  if (input.tipoEntrega === "envio" && !input.direccionEntrega?.trim()) {
    return { error: "Falta la dirección de envío" };
  }

  const supabase = await createClient();
  const pedidoId = crypto.randomUUID();
  const costoEnvio = input.tipoEntrega === "envio" ? input.costoEnvio ?? 0 : 0;
  const total =
    input.items.reduce((acc, it) => acc + it.cantidad * it.precioUnitario, 0) +
    costoEnvio;

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
    tipo_entrega: input.tipoEntrega,
    direccion_entrega:
      input.tipoEntrega === "envio" ? input.direccionEntrega?.trim() : null,
    hora_retiro: input.horaRetiro || null,
    metodo_pago: input.metodoPago,
    costo_envio: costoEnvio,
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
