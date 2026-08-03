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

export async function crearEmpleado(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const nombre = campoTexto(formData, "nombre");
  if (!nombre) return { error: "El nombre es obligatorio" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("empleados").insert({
    apellido: campoTexto(formData, "apellido"),
    nombre,
    dni: campoTexto(formData, "dni"),
    domicilio: campoTexto(formData, "domicilio"),
    fecha_nacimiento: campoFecha(formData, "fecha_nacimiento"),
    fecha_alta: campoFecha(formData, "fecha_alta"),
    mes_vacaciones: campoTexto(formData, "mes_vacaciones"),
    obra_social: campoTexto(formData, "obra_social"),
    responsable: campoTexto(formData, "responsable"),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/empleados");
  return { ok: true };
}

export async function actualizarEmpleado(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const nombre = campoTexto(formData, "nombre");
  if (!nombre) return { error: "El nombre es obligatorio" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("empleados")
    .update({
      apellido: campoTexto(formData, "apellido"),
      nombre,
      dni: campoTexto(formData, "dni"),
      domicilio: campoTexto(formData, "domicilio"),
      fecha_nacimiento: campoFecha(formData, "fecha_nacimiento"),
      fecha_alta: campoFecha(formData, "fecha_alta"),
      mes_vacaciones: campoTexto(formData, "mes_vacaciones"),
      obra_social: campoTexto(formData, "obra_social"),
      responsable: campoTexto(formData, "responsable"),
      activo: formData.get("activo") === "on",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/empleados");
  return { ok: true };
}

export async function eliminarEmpleado(id: string): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("empleados").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/empleados");
  return { ok: true };
}
