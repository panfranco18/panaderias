"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPerfilActual } from "@/lib/auth/current-perfil";

export type FichajeState = { error?: string; ok?: boolean };

export async function ficharEntrada(): Promise<FichajeState> {
  const perfil = await getPerfilActual();
  if (!perfil) return { error: "No estás autenticado." };
  if (!perfil.sucursalId) {
    return { error: "Tu usuario no tiene una sucursal asignada." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("registro_ingreso_personal").insert({
    perfil_id: perfil.id,
    sucursal_id: perfil.sucursalId,
    tipo: "entrada",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function ficharSalida(): Promise<FichajeState> {
  const perfil = await getPerfilActual();
  if (!perfil) return { error: "No estás autenticado." };
  if (!perfil.sucursalId) {
    return { error: "Tu usuario no tiene una sucursal asignada." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("registro_ingreso_personal").insert({
    perfil_id: perfil.id,
    sucursal_id: perfil.sucursalId,
    tipo: "salida",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}
