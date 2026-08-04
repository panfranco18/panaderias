"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

const GESTION = ["superadmin", "encargado_sucursal"] as const;

export async function crearTurno(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol([...GESTION]);
  if ("error" in auth) return auth;

  const perfilId = String(formData.get("perfil_id") || "");
  const sucursalId = String(formData.get("sucursal_id") || "");
  const fecha = String(formData.get("fecha") || "");
  const horaInicio = String(formData.get("hora_inicio") || "");
  const horaFin = String(formData.get("hora_fin") || "");
  const notas = String(formData.get("notas") || "").trim() || null;

  if (!perfilId) return { error: "Elegí un empleado" };
  if (!sucursalId) return { error: "Elegí una sucursal" };
  if (!fecha) return { error: "Falta la fecha" };
  if (!horaInicio || !horaFin) return { error: "Faltan los horarios" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("turnos_personal").insert({
    perfil_id: perfilId,
    sucursal_id: sucursalId,
    fecha,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    notas,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/horarios");
  return { ok: true };
}

export async function eliminarTurno(id: string): Promise<ActionState> {
  const auth = await requireRol([...GESTION]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("turnos_personal").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/horarios");
  return { ok: true };
}
