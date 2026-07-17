"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRolEnSucursal } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

const STAFF = ["superadmin", "encargado_sucursal", "empleado"] as const;

export async function crearFacturaVenta(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const sucursalId = String(formData.get("sucursal_id") || "");
  const numero = String(formData.get("numero") || "").trim() || null;
  const cuitCliente = String(formData.get("cuit_cliente") || "").trim() || null;
  const metodoPago = String(formData.get("metodo_pago") || "").trim() || null;
  const monto = Number(formData.get("monto") || 0);
  const fecha = String(formData.get("fecha") || "") || undefined;

  if (!sucursalId) return { error: "Falta la sucursal" };
  if (!monto || monto <= 0) return { error: "El monto debe ser mayor a 0" };

  const auth = await requireRolEnSucursal([...STAFF], sucursalId);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();

  const { data: venta, error: ventaError } = await supabase
    .from("ventas")
    .insert({
      sucursal_id: sucursalId,
      origen: "sucursal",
      usuario_id: auth.perfil.id,
      total: monto,
      metodo_pago: metodoPago,
      fecha,
    })
    .select()
    .single();

  if (ventaError) return { error: ventaError.message };

  const { error: facturaError } = await supabase.from("facturas_venta").insert({
    venta_id: venta.id,
    numero,
    cuit_cliente: cuitCliente,
    monto,
    fecha,
  });

  if (facturaError) return { error: facturaError.message };

  revalidatePath("/admin/facturacion");
  revalidatePath("/admin");
  return { ok: true };
}

export async function eliminarFacturaVenta(
  id: string,
  ventaId: string | null
): Promise<ActionState> {
  const supabase = createAdminClient();

  let sucursalId: string | null = null;
  if (ventaId) {
    const { data: venta } = await supabase
      .from("ventas")
      .select("sucursal_id")
      .eq("id", ventaId)
      .maybeSingle();
    sucursalId = venta?.sucursal_id ?? null;
  }

  const auth = await requireRolEnSucursal([...STAFF], sucursalId);
  if ("error" in auth) return auth;

  const { error } = await supabase.from("facturas_venta").delete().eq("id", id);
  if (error) return { error: error.message };

  if (ventaId) {
    await supabase.from("ventas").delete().eq("id", ventaId);
  }

  revalidatePath("/admin/facturacion");
  revalidatePath("/admin");
  return { ok: true };
}
