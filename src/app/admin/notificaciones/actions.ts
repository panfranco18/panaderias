"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

const STAFF = ["superadmin", "encargado_sucursal", "empleado"] as const;

export async function marcarNotificacionLeida(id: string): Promise<ActionState> {
  const auth = await requireRol([...STAFF]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function marcarTodasLeidas(): Promise<ActionState> {
  const auth = await requireRol([...STAFF]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();

  let query = supabase.from("notificaciones").update({ leida: true }).eq("leida", false);
  if (auth.perfil.rol !== "superadmin") {
    query = auth.perfil.sucursalId
      ? query.or(`sucursal_id.is.null,sucursal_id.eq.${auth.perfil.sucursalId}`)
      : query.is("sucursal_id", null);
  }

  const { error } = await query;
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { ok: true };
}
