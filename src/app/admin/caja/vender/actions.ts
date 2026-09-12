"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRolEnSucursal } from "@/lib/auth/current-perfil";
import { notificarVenta } from "@/lib/notificaciones";

const STAFF = ["superadmin", "encargado_sucursal", "empleado"] as const;

export type ItemCarrito = {
  id: string;
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  unidadMedida?: string;
  montoVariable?: boolean;
};

export type VentaCreada = {
  id: string;
  numeroTicket: number | null;
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
  ventaTipo: "venta_1" | "venta_deleite";
  items: ItemCarrito[];
}): Promise<CrearVentaResult> {
  if (!input.sucursalId) return { error: "Falta la sucursal" };
  if (!input.items?.length) return { error: "El carrito está vacío" };
  if (input.ventaTipo !== "venta_1" && input.ventaTipo !== "venta_deleite") {
    return { error: "Elegí Venta 1 o Venta Deleite" };
  }

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

  let { data: venta, error: ventaError } = await supabase
    .from("ventas")
    .insert({
      sucursal_id: input.sucursalId,
      origen: "sucursal",
      usuario_id: auth.perfil.id,
      total,
      metodo_pago: input.metodoPago || null,
      venta_tipo: input.ventaTipo,
    })
    .select()
    .single();

  // venta_tipo todavía puede no existir si no se corrió supabase/018_arqueo_y_avisos_cierre.sql
  if (ventaError && ventaError.message.includes("venta_tipo")) {
    const retry = await supabase
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
    venta = retry.data;
    ventaError = retry.error;
  }

  if (ventaError || !venta) return { error: ventaError?.message ?? "No se pudo crear la venta" };

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

  const { data: usuario } = await supabase
    .from("perfiles")
    .select("nombre")
    .eq("id", auth.perfil.id)
    .maybeSingle();

  await notificarVenta(supabase, {
    sucursalId: input.sucursalId,
    sucursalNombre: sucursal?.nombre ?? "",
    monto: total,
    descripcion: "Venta (POS)",
    usuarioNombre: usuario?.nombre,
  });

  revalidatePath("/admin/caja");
  revalidatePath("/admin");

  return {
    ok: true,
    venta: {
      id: venta.id,
      numeroTicket: venta.numero_ticket ?? null,
      fecha: venta.fecha,
      total,
      metodoPago: input.metodoPago || null,
      sucursalNombre: sucursal?.nombre ?? "",
      items: input.items,
    },
  };
}
