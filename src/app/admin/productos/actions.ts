"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/auth/current-perfil";
import { notificarCambioPrecio } from "@/lib/notificaciones";

export type ActionState = { error?: string; ok?: boolean };

async function subirImagen(
  supabase: ReturnType<typeof createAdminClient>,
  imagen: File
) {
  if (!imagen || imagen.size === 0) return null;

  const ext = imagen.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await imagen.arrayBuffer());

  const { error } = await supabase.storage
    .from("productos")
    .upload(path, buffer, { contentType: imagen.type || "image/jpeg" });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("productos").getPublicUrl(path);
  return data.publicUrl;
}

// codigo_barras puede no existir todavía si no se corrió supabase/002_codigo_barras.sql
function esColumnaFaltante(mensaje: string) {
  return mensaje.includes("column") && mensaje.includes("does not exist");
}

export async function crearProducto(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin", "encargado_sucursal"]);
  if ("error" in auth) return auth;

  const nombre = String(formData.get("nombre") || "").trim();
  const categoria = String(formData.get("categoria") || "").trim();
  const descripcion = String(formData.get("descripcion") || "").trim() || null;
  const precioBase = Number(formData.get("precio_base") || 0);
  const codigoBarras = String(formData.get("codigo_barras") || "").trim() || null;
  const unidadMedida = String(formData.get("unidad_medida") || "unidad");
  const stockMinimo = Number(formData.get("stock_minimo") || 0);
  const imagen = formData.get("imagen") as File | null;

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (!categoria) return { error: "La categoría es obligatoria" };

  const supabase = createAdminClient();

  let imagenUrl: string | null = null;
  try {
    if (imagen) imagenUrl = await subirImagen(supabase, imagen);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir la imagen" };
  }

  const { error } = await supabase.from("productos").insert({
    nombre,
    categoria,
    descripcion,
    precio_base: precioBase,
    imagen_url: imagenUrl,
    codigo_barras: codigoBarras,
    unidad_medida: unidadMedida,
    stock_minimo: stockMinimo,
  });

  if (error) {
    if (esColumnaFaltante(error.message)) {
      const { error: error2 } = await supabase.from("productos").insert({
        nombre,
        categoria,
        descripcion,
        precio_base: precioBase,
        imagen_url: imagenUrl,
      });
      if (error2) return { error: error2.message };
    } else {
      return { error: error.message };
    }
  }

  revalidatePath("/admin/productos");
  return { ok: true };
}

export async function actualizarProducto(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin", "encargado_sucursal"]);
  if ("error" in auth) return auth;

  const nombre = String(formData.get("nombre") || "").trim();
  const categoria = String(formData.get("categoria") || "").trim();
  const descripcion = String(formData.get("descripcion") || "").trim() || null;
  const precioBase = Number(formData.get("precio_base") || 0);
  const activo = formData.get("activo") === "on";
  const codigoBarras = String(formData.get("codigo_barras") || "").trim() || null;
  const unidadMedida = String(formData.get("unidad_medida") || "unidad");
  const stockMinimo = Number(formData.get("stock_minimo") || 0);
  const imagen = formData.get("imagen") as File | null;

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (!categoria) return { error: "La categoría es obligatoria" };

  const supabase = createAdminClient();

  const { data: productoActual } = await supabase
    .from("productos")
    .select("precio_base")
    .eq("id", id)
    .maybeSingle();

  const update: Record<string, unknown> = {
    nombre,
    categoria,
    descripcion,
    precio_base: precioBase,
    activo,
    codigo_barras: codigoBarras,
    unidad_medida: unidadMedida,
    stock_minimo: stockMinimo,
  };

  try {
    if (imagen && imagen.size > 0) {
      update.imagen_url = await subirImagen(supabase, imagen);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir la imagen" };
  }

  const { error } = await supabase.from("productos").update(update).eq("id", id);

  if (error) {
    if (esColumnaFaltante(error.message)) {
      delete update.codigo_barras;
      delete update.stock_minimo;
      const { error: error2 } = await supabase
        .from("productos")
        .update(update)
        .eq("id", id);
      if (error2) return { error: error2.message };
    } else {
      return { error: error.message };
    }
  }

  if (productoActual && Number(productoActual.precio_base) !== precioBase) {
    await notificarCambioPrecio(supabase, {
      productoId: id,
      nombre,
      precioAnterior: Number(productoActual.precio_base),
      precioNuevo: precioBase,
    });
  }

  revalidatePath("/admin/productos");
  return { ok: true };
}

export async function eliminarProducto(id: string): Promise<ActionState> {
  const auth = await requireRol(["superadmin", "encargado_sucursal"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/productos");
  return { ok: true };
}

export async function actualizarPrecioGlobal(
  productoId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin", "encargado_sucursal"]);
  if ("error" in auth) return auth;

  const precio = Number(formData.get("precio") || 0);
  if (!precio || precio <= 0) return { error: "El precio debe ser mayor a 0" };

  const supabase = createAdminClient();

  const { data: productoActual } = await supabase
    .from("productos")
    .select("nombre, precio_base")
    .eq("id", productoId)
    .maybeSingle();

  const { error } = await supabase
    .from("productos")
    .update({ precio_base: precio })
    .eq("id", productoId);

  if (error) return { error: error.message };

  // Al aplicar un precio único a todas las sucursales, se borran los overrides
  // para que ninguna sucursal quede con un precio distinto por accidente.
  await supabase
    .from("productos_precios_sucursal")
    .delete()
    .eq("producto_id", productoId);

  if (productoActual) {
    await notificarCambioPrecio(supabase, {
      productoId,
      nombre: productoActual.nombre,
      precioAnterior: Number(productoActual.precio_base),
      precioNuevo: precio,
    });
  }

  revalidatePath("/admin/productos");
  return { ok: true };
}

export async function guardarPreciosSucursal(
  productoId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin", "encargado_sucursal"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();

  const [{ data: sucursales }, { data: producto }, { data: preciosActuales }] =
    await Promise.all([
      supabase.from("sucursales").select("id, nombre"),
      supabase.from("productos").select("nombre, precio_base").eq("id", productoId).maybeSingle(),
      supabase
        .from("productos_precios_sucursal")
        .select("sucursal_id, precio")
        .eq("producto_id", productoId),
    ]);

  for (const s of sucursales ?? []) {
    const raw = String(formData.get(`precio_${s.id}`) || "").trim();
    const precioAnterior =
      preciosActuales?.find((p) => p.sucursal_id === s.id)?.precio ??
      producto?.precio_base ??
      0;

    if (raw === "") {
      await supabase
        .from("productos_precios_sucursal")
        .delete()
        .eq("producto_id", productoId)
        .eq("sucursal_id", s.id);
      continue;
    }

    const precio = Number(raw);
    if (Number.isNaN(precio)) continue;

    await supabase
      .from("productos_precios_sucursal")
      .upsert(
        { producto_id: productoId, sucursal_id: s.id, precio },
        { onConflict: "producto_id,sucursal_id" }
      );

    if (producto && Number(precioAnterior) !== precio) {
      await notificarCambioPrecio(supabase, {
        productoId,
        nombre: producto.nombre,
        precioAnterior: Number(precioAnterior),
        precioNuevo: precio,
        sucursalId: s.id,
        sucursalNombre: s.nombre,
      });
    }
  }

  revalidatePath("/admin/productos");
  return { ok: true };
}
