"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPerfilActual } from "@/lib/auth/current-perfil";
import { notificarFichaje } from "@/lib/notificaciones";

export type FichajeState = { error?: string; ok?: boolean };

async function registrarYNotificar(
  tipo: "entrada" | "salida",
  perfilId: string,
  sucursalId: string
): Promise<FichajeState> {
  const supabase = createAdminClient();

  const { data: registro, error } = await supabase
    .from("registro_ingreso_personal")
    .insert({ perfil_id: perfilId, sucursal_id: sucursalId, tipo })
    .select("fecha")
    .single();

  if (error) return { error: error.message };

  const [{ data: perfilInfo }, { data: sucursal }] = await Promise.all([
    supabase.from("perfiles").select("nombre").eq("id", perfilId).maybeSingle(),
    supabase.from("sucursales").select("nombre").eq("id", sucursalId).maybeSingle(),
  ]);

  await notificarFichaje(supabase, {
    tipo,
    sucursalId,
    sucursalNombre: sucursal?.nombre ?? "",
    nombreEmpleado: perfilInfo?.nombre ?? "Alguien",
    hora: registro.fecha,
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function ficharEntrada(): Promise<FichajeState> {
  const perfil = await getPerfilActual();
  if (!perfil) return { error: "No estás autenticado." };
  if (!perfil.sucursalId) {
    return { error: "Tu usuario no tiene una sucursal asignada." };
  }

  return registrarYNotificar("entrada", perfil.id, perfil.sucursalId);
}

export async function ficharSalida(): Promise<FichajeState> {
  const perfil = await getPerfilActual();
  if (!perfil) return { error: "No estás autenticado." };
  if (!perfil.sucursalId) {
    return { error: "Tu usuario no tiene una sucursal asignada." };
  }

  return registrarYNotificar("salida", perfil.id, perfil.sucursalId);
}
