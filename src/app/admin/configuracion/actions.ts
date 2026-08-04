"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

export async function guardarConfiguracion(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const mercadopagoAlias = String(formData.get("mercadopago_alias") || "").trim() || null;
  const mercadopagoTitular = String(formData.get("mercadopago_titular") || "").trim() || null;
  const mercadopagoCbu = String(formData.get("mercadopago_cbu") || "").trim() || null;

  const supabase = createAdminClient();

  const { data: existente } = await supabase
    .from("configuracion_negocio")
    .select("id")
    .limit(1)
    .maybeSingle();

  const payload = {
    mercadopago_alias: mercadopagoAlias,
    mercadopago_titular: mercadopagoTitular,
    mercadopago_cbu: mercadopagoCbu,
    updated_at: new Date().toISOString(),
  };

  const { error } = existente
    ? await supabase
        .from("configuracion_negocio")
        .update(payload)
        .eq("id", existente.id)
    : await supabase.from("configuracion_negocio").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  return { ok: true };
}

export async function actualizarMiCuenta(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const nombre = String(formData.get("nombre") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const confirmarPassword = String(formData.get("confirmar_password") || "").trim();

  if (!nombre && !password) {
    return { error: "Ingresá un nombre o una contraseña nueva" };
  }
  if (password && password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }
  if (password && password !== confirmarPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  const supabase = createAdminClient();

  if (nombre) {
    const { error } = await supabase
      .from("perfiles")
      .update({ nombre })
      .eq("id", auth.perfil.id);
    if (error) return { error: error.message };
  }

  if (password) {
    const { error } = await supabase.auth.admin.updateUserById(auth.perfil.id, {
      password,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
