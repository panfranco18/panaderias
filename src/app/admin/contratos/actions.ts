"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

function campoTexto(formData: FormData, nombre: string) {
  return String(formData.get(nombre) || "").trim() || null;
}

function campoFecha(formData: FormData, nombre: string) {
  const v = String(formData.get(nombre) || "").trim();
  return v || null;
}

export async function crearContrato(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const local = campoTexto(formData, "local");
  if (!local) return { error: "El local es obligatorio" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("contratos_alquiler").insert({
    local,
    sucursal_id: campoTexto(formData, "sucursal_id"),
    fecha_inicio: campoFecha(formData, "fecha_inicio"),
    fecha_fin: campoFecha(formData, "fecha_fin"),
    aumentos: campoTexto(formData, "aumentos"),
    arreglos: campoTexto(formData, "arreglos"),
    observaciones: campoTexto(formData, "observaciones"),
    titular: campoTexto(formData, "titular"),
    inmobiliaria: campoTexto(formData, "inmobiliaria"),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/contratos");
  return { ok: true };
}

export async function actualizarContrato(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const local = campoTexto(formData, "local");
  if (!local) return { error: "El local es obligatorio" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contratos_alquiler")
    .update({
      local,
      sucursal_id: campoTexto(formData, "sucursal_id"),
      fecha_inicio: campoFecha(formData, "fecha_inicio"),
      fecha_fin: campoFecha(formData, "fecha_fin"),
      aumentos: campoTexto(formData, "aumentos"),
      arreglos: campoTexto(formData, "arreglos"),
      observaciones: campoTexto(formData, "observaciones"),
      titular: campoTexto(formData, "titular"),
      inmobiliaria: campoTexto(formData, "inmobiliaria"),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/contratos");
  return { ok: true };
}

export async function eliminarContrato(id: string): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("contratos_alquiler").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/contratos");
  return { ok: true };
}
