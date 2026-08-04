"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/auth/current-perfil";

export type ActionState = {
  error?: string;
  ok?: boolean;
  passwordTemporal?: string;
};

const MODULOS = [
  "productos",
  "categorias",
  "sucursales",
  "personal",
  "horarios",
  "proveedores",
  "stock",
  "pedidos",
  "caja",
  "facturacion",
  "reportes",
] as const;

function nivelAccesoDesdeForm(formData: FormData) {
  const nivel: Record<string, boolean> = {};
  for (const modulo of MODULOS) {
    nivel[modulo] = formData.get(`acceso_${modulo}`) === "on";
  }
  return nivel;
}

function generarPassword() {
  return Math.random().toString(36).slice(-8) + "A1!";
}

export async function crearEmpleado(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const nombre = String(formData.get("nombre") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const cargo = String(formData.get("cargo") || "").trim() || null;
  const rol = String(formData.get("rol") || "empleado");
  const sucursalId = String(formData.get("sucursal_id") || "") || null;

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (!email) return { error: "El email es obligatorio (se usa para el login)" };

  const supabase = createAdminClient();
  const password = generarPassword();

  const { data: userData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) return { error: authError.message };

  const { error: perfilError } = await supabase.from("perfiles").insert({
    id: userData.user.id,
    nombre,
    cargo,
    rol,
    sucursal_id: sucursalId,
    nivel_acceso: nivelAccesoDesdeForm(formData),
  });

  if (perfilError) {
    await supabase.auth.admin.deleteUser(userData.user.id);
    return { error: perfilError.message };
  }

  revalidatePath("/admin/personal");
  revalidatePath("/admin/sucursales");
  return { ok: true, passwordTemporal: password };
}

export async function darAccesoAEmpleado(
  empleadoId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const email = String(formData.get("email") || "").trim();
  const cargo = String(formData.get("cargo") || "").trim() || null;
  const rol = String(formData.get("rol") || "empleado");
  const sucursalId = String(formData.get("sucursal_id") || "") || null;

  if (!email) return { error: "El email es obligatorio (se usa para el login)" };

  const supabase = createAdminClient();

  const { data: yaTieneAcceso } = await supabase
    .from("perfiles")
    .select("id")
    .eq("empleado_id", empleadoId)
    .maybeSingle();
  if (yaTieneAcceso) return { error: "Este empleado ya tiene acceso al panel." };

  const { data: empleado, error: empleadoError } = await supabase
    .from("empleados")
    .select("nombre, apellido")
    .eq("id", empleadoId)
    .single();
  if (empleadoError || !empleado) return { error: "No se encontró el empleado." };

  const nombreCompleto = [empleado.nombre, empleado.apellido].filter(Boolean).join(" ");
  const password = generarPassword();

  const { data: userData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) return { error: authError.message };

  const { error: perfilError } = await supabase.from("perfiles").insert({
    id: userData.user.id,
    nombre: nombreCompleto,
    cargo,
    rol,
    sucursal_id: sucursalId,
    empleado_id: empleadoId,
    nivel_acceso: nivelAccesoDesdeForm(formData),
  });

  if (perfilError) {
    await supabase.auth.admin.deleteUser(userData.user.id);
    return { error: perfilError.message };
  }

  revalidatePath("/admin/personal");
  revalidatePath("/admin/sucursales");
  revalidatePath("/admin/empleados");
  return { ok: true, passwordTemporal: password };
}

export async function actualizarEmpleado(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const nombre = String(formData.get("nombre") || "").trim();
  const cargo = String(formData.get("cargo") || "").trim() || null;
  const rol = String(formData.get("rol") || "empleado");
  const sucursalId = String(formData.get("sucursal_id") || "") || null;
  const activo = formData.get("activo") === "on";

  if (!nombre) return { error: "El nombre es obligatorio" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("perfiles")
    .update({
      nombre,
      cargo,
      rol,
      sucursal_id: sucursalId,
      activo,
      nivel_acceso: nivelAccesoDesdeForm(formData),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/personal");
  revalidatePath("/admin/sucursales");
  return { ok: true };
}

export async function eliminarEmpleado(id: string): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  revalidatePath("/admin/personal");
  revalidatePath("/admin/sucursales");
  return { ok: true };
}
