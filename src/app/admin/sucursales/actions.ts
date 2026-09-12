"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

export async function crearSucursal(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const nombre = String(formData.get("nombre") || "").trim();
  const telefono = String(formData.get("telefono") || "").trim() || null;
  const direccion = String(formData.get("direccion") || "").trim() || null;
  const horarioAtencion = String(formData.get("horario_atencion") || "").trim() || null;
  const costoEnvio = Number(formData.get("costo_envio") || 0);
  const puntoVentaForm = String(formData.get("punto_venta") || "").trim();

  if (!nombre) return { error: "El nombre es obligatorio" };

  const supabase = createAdminClient();

  // Si no se especifica, se asigna el próximo punto de venta libre (cada
  // sucursal necesita el suyo para numerar sus propios comprobantes).
  let puntoVenta = puntoVentaForm.padStart(4, "0");
  if (!puntoVentaForm) {
    const { data: existentes } = await supabase.from("sucursales").select("punto_venta");
    const maxActual = (existentes ?? []).reduce((max, s) => {
      const n = parseInt(s.punto_venta ?? "0", 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    puntoVenta = String(maxActual + 1).padStart(4, "0");
  }

  const { error } = await supabase
    .from("sucursales")
    .insert({
      nombre,
      telefono,
      direccion,
      horario_atencion: horarioAtencion,
      costo_envio: costoEnvio,
      punto_venta: puntoVenta,
    });

  if (error) return { error: error.message };

  revalidatePath("/admin/sucursales");
  return { ok: true };
}

export async function actualizarSucursal(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const nombre = String(formData.get("nombre") || "").trim();
  const telefono = String(formData.get("telefono") || "").trim() || null;
  const direccion = String(formData.get("direccion") || "").trim() || null;
  const horarioAtencion = String(formData.get("horario_atencion") || "").trim() || null;
  const costoEnvio = Number(formData.get("costo_envio") || 0);
  const puntoVenta = String(formData.get("punto_venta") || "").trim() || "0001";
  const activa = formData.get("activa") === "on";

  if (!nombre) return { error: "El nombre es obligatorio" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("sucursales")
    .update({
      nombre,
      telefono,
      direccion,
      horario_atencion: horarioAtencion,
      costo_envio: costoEnvio,
      punto_venta: puntoVenta.padStart(4, "0"),
      activa,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/sucursales");
  return { ok: true };
}

export async function eliminarSucursal(id: string): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("sucursales").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/sucursales");
  return { ok: true };
}
