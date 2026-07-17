"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRolEnSucursal } from "@/lib/auth/current-perfil";

const STAFF = ["superadmin", "encargado_sucursal", "empleado"] as const;

export type ItemCarrito = {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  unidadMedida?: string;
};

export type VentaCreada = {
  id: string;
  fecha: string;
  total: number;
  metodoPago: string | null;
  sucursalNombre: string;
  items: ItemCarrito[];
};

export type CrearVentaResult =
  | { error: string }
  | { ok: true; venta: VentaCreada };

export async function crearVenta(input: {
  sucursalId: string;
  metodoPago: string;
  items: ItemCarrito[];
}): Promise<CrearVentaResult> {
  if (!input.sucursalId) return { error: "Falta la sucursal" };
  if (!input.items?.length) return { error: "El carrito está vacío" };

  const auth = await requireRolEnSucursal([...STAFF], input.sucursalId);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();

  const { data: sucursal } = await supabase
    .from("sucursales")
    .select("nombre")
    .eq("id", input.sucursalId)
    .single();

  const total = input.items.reduce(
    (acc, it) => acc + it.cantidad * it.precioUnitario,
    0
  );

  const { data: venta, error: ventaError } = await supabase
    .from("ventas")
    .insert({
      sucursal_id: input.sucursalId,
      origen: "sucursal",
      usuario_id: auth.perfil.id,
      total,
      metodo_pago: input.metodoPago || null,
    })
    .select()
    .single();

  if (ventaError) return { error: ventaError.message };

  const itemsPayload = input.items.map((it) => ({
    venta_id: venta.id,
    producto_id: it.productoId,
    cantidad: it.cantidad,
    precio_unitario: it.precioUnitario,
  }));

  const { error: itemsError } = await supabase
    .from("items_venta")
    .insert(itemsPayload);

  if (itemsError) return { error: itemsError.message };

  const { error: cajaError } = await supabase.from("caja_movimientos").insert({
    sucursal_id: input.sucursalId,
    tipo: "ingreso",
    monto: total,
    descripcion: "Venta (POS)",
    usuario_id: auth.perfil.id,
  });

  if (cajaError) return { error: cajaError.message };

  revalidatePath("/admin/caja");
  revalidatePath("/admin");

  return {
    ok: true,
    venta: {
      id: venta.id,
      fecha: venta.fecha,
      total,
      metodoPago: input.metodoPago || null,
      sucursalNombre: sucursal?.nombre ?? "",
      items: input.items,
    },
  };
}
