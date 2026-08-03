"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRolEnSucursal } from "@/lib/auth/current-perfil";
import { revisarStockBajo } from "@/lib/notificaciones";

export type ActionState = { error?: string; ok?: boolean };

export async function registrarMovimiento(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const productoId = String(formData.get("producto_id") || "");
  const sucursalId = String(formData.get("sucursal_id") || "");
  const tipo = String(formData.get("tipo") || "ingreso");
  const cantidad = Number(formData.get("cantidad") || 0);
  const motivo = String(formData.get("motivo") || "").trim() || null;

  if (!productoId || !sucursalId) return { error: "Falta producto o sucursal" };
  if (!cantidad || cantidad <= 0) return { error: "La cantidad debe ser mayor a 0" };

  const auth = await requireRolEnSucursal(
    ["superadmin", "encargado_sucursal", "empleado"],
    sucursalId
  );
  if ("error" in auth) return auth;

  const supabase = createAdminClient();

  const { data: stockExistente } = await supabase
    .from("stock")
    .select("*")
    .eq("producto_id", productoId)
    .eq("sucursal_id", sucursalId)
    .maybeSingle();

  let nuevaCantidad: number;
  if (tipo === "ingreso") {
    nuevaCantidad = Number(stockExistente?.cantidad ?? 0) + cantidad;
  } else if (tipo === "egreso") {
    nuevaCantidad = Math.max(0, Number(stockExistente?.cantidad ?? 0) - cantidad);
  } else {
    nuevaCantidad = cantidad;
  }

  let stockId: string;
  if (stockExistente) {
    const { error } = await supabase
      .from("stock")
      .update({ cantidad: nuevaCantidad })
      .eq("id", stockExistente.id);
    if (error) return { error: error.message };
    stockId = stockExistente.id;
  } else {
    const { data: nuevo, error } = await supabase
      .from("stock")
      .insert({ producto_id: productoId, sucursal_id: sucursalId, cantidad: nuevaCantidad })
      .select()
      .single();
    if (error) return { error: error.message };
    stockId = nuevo.id;
  }

  const { error: movError } = await supabase.from("movimientos_stock").insert({
    stock_id: stockId,
    tipo,
    cantidad,
    motivo,
    usuario_id: auth.perfil.id,
  });
  if (movError) return { error: movError.message };

  await revisarStockBajo(supabase, {
    productoId,
    sucursalId,
    cantidadNueva: nuevaCantidad,
  });

  revalidatePath("/admin/stock");
  revalidatePath("/admin");
  return { ok: true };
}
