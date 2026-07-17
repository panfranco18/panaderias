"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

export async function crearProveedor(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const nombre = String(formData.get("nombre") || "").trim();
  const telefono = String(formData.get("telefono") || "").trim() || null;
  const contacto = String(formData.get("contacto") || "").trim() || null;
  const notas = String(formData.get("notas") || "").trim() || null;

  if (!nombre) return { error: "El nombre es obligatorio" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("proveedores")
    .insert({ nombre, telefono, contacto, notas });

  if (error) return { error: error.message };

  revalidatePath("/admin/proveedores");
  return { ok: true };
}

export async function actualizarProveedor(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const nombre = String(formData.get("nombre") || "").trim();
  const telefono = String(formData.get("telefono") || "").trim() || null;
  const contacto = String(formData.get("contacto") || "").trim() || null;
  const notas = String(formData.get("notas") || "").trim() || null;

  if (!nombre) return { error: "El nombre es obligatorio" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("proveedores")
    .update({ nombre, telefono, contacto, notas })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/proveedores");
  return { ok: true };
}

export async function eliminarProveedor(id: string): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("proveedores").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/proveedores");
  return { ok: true };
}

export async function crearFacturaProveedor(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const proveedorId = String(formData.get("proveedor_id") || "") || null;
  const sucursalId = String(formData.get("sucursal_id") || "") || null;
  const numeroFactura = String(formData.get("numero_factura") || "").trim() || null;
  const monto = Number(formData.get("monto") || 0);
  const fecha = String(formData.get("fecha") || "") || undefined;
  const imagen = formData.get("imagen") as File | null;

  if (!monto || monto <= 0) return { error: "El monto es obligatorio" };

  const supabase = createAdminClient();

  let imagenPath: string | null = null;
  if (imagen && imagen.size > 0) {
    const ext = imagen.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await imagen.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("facturas-proveedores")
      .upload(path, buffer, { contentType: imagen.type || "image/jpeg" });
    if (uploadError) return { error: uploadError.message };
    imagenPath = path;
  }

  const { error } = await supabase.from("facturas_proveedor").insert({
    proveedor_id: proveedorId,
    sucursal_id: sucursalId,
    numero_factura: numeroFactura,
    monto,
    fecha,
    imagen_url: imagenPath,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/proveedores");
  return { ok: true };
}

export async function eliminarFacturaProveedor(id: string): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("facturas_proveedor")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/proveedores");
  return { ok: true };
}
