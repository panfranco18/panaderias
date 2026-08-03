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

export async function crearGasto(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const categoria = campoTexto(formData, "categoria");
  if (!categoria) return { error: "La categoría es obligatoria" };

  const montoStr = String(formData.get("monto") || "").trim();
  const monto = montoStr ? Number(montoStr) : null;

  const supabase = createAdminClient();
  const { error } = await supabase.from("gastos").insert({
    categoria,
    fecha: campoFecha(formData, "fecha"),
    detalle: campoTexto(formData, "detalle"),
    monto,
    vencimiento: campoFecha(formData, "vencimiento"),
    fecha_pago: campoFecha(formData, "fecha_pago"),
    otros: campoTexto(formData, "otros"),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/gastos");
  return { ok: true };
}

export async function eliminarGasto(id: string): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("gastos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/gastos");
  return { ok: true };
}
