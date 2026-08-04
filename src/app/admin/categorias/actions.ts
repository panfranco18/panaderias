"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

const STAFF_PRODUCTOS = ["superadmin", "encargado_sucursal"] as const;

async function subirImagenCategoria(
  supabase: ReturnType<typeof createAdminClient>,
  imagen: File
) {
  if (!imagen || imagen.size === 0) return null;

  const ext = imagen.name.split(".").pop() || "jpg";
  const path = `categorias/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await imagen.arrayBuffer());

  const { error } = await supabase.storage
    .from("productos")
    .upload(path, buffer, { contentType: imagen.type || "image/jpeg" });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("productos").getPublicUrl(path);
  return data.publicUrl;
}

export async function crearCategoria(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol([...STAFF_PRODUCTOS]);
  if ("error" in auth) return auth;

  const nombre = String(formData.get("nombre") || "").trim();
  const visible = formData.get("visible_web") === "on";
  const permiteFaltante = formData.get("permite_reportar_faltante") === "on";
  const imagen = formData.get("imagen") as File | null;

  if (!nombre) return { error: "El nombre de la categoría es obligatorio" };

  const supabase = createAdminClient();

  const { data: existente } = await supabase
    .from("categorias_config")
    .select("categoria")
    .eq("categoria", nombre)
    .maybeSingle();
  if (existente) return { error: "Ya existe una categoría con ese nombre" };

  let imagenUrl: string | null = null;
  try {
    if (imagen) imagenUrl = await subirImagenCategoria(supabase, imagen);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir la imagen" };
  }

  const { error } = await supabase.from("categorias_config").insert({
    categoria: nombre,
    visible_web: visible,
    permite_reportar_faltante: permiteFaltante,
    imagen_url: imagenUrl,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { ok: true };
}

export async function actualizarCategoria(
  categoria: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol([...STAFF_PRODUCTOS]);
  if ("error" in auth) return auth;

  const visible = formData.get("visible_web") === "on";
  const permiteFaltante = formData.get("permite_reportar_faltante") === "on";
  const imagen = formData.get("imagen") as File | null;

  const supabase = createAdminClient();

  const update: Record<string, unknown> = {
    visible_web: visible,
    permite_reportar_faltante: permiteFaltante,
  };

  try {
    if (imagen && imagen.size > 0) {
      update.imagen_url = await subirImagenCategoria(supabase, imagen);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir la imagen" };
  }

  const { error } = await supabase
    .from("categorias_config")
    .update(update)
    .eq("categoria", categoria);

  if (error) return { error: error.message };

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { ok: true };
}

export async function eliminarCategoria(categoria: string): Promise<ActionState> {
  const auth = await requireRol([...STAFF_PRODUCTOS]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("categorias_config")
    .delete()
    .eq("categoria", categoria);

  if (error) return { error: error.message };

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { ok: true };
}
