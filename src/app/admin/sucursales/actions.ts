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

  if (!nombre) return { error: "El nombre es obligatorio" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("sucursales")
    .insert({
      nombre,
      telefono,
      direccion,
      horario_atencion: horarioAtencion,
      costo_envio: costoEnvio,
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
