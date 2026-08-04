"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

export async function crearAviso(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const mensaje = String(formData.get("mensaje") || "").trim();
  const perfilId = String(formData.get("perfil_id") || "") || null;
  const fecha = String(formData.get("fecha") || "") || undefined;

  if (!mensaje) return { error: "Escribí el mensaje del aviso" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("avisos_personal").insert({
    mensaje,
    perfil_id: perfilId,
    fecha,
    creado_por: auth.perfil.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function eliminarAviso(id: string): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("avisos_personal").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { ok: true };
}
