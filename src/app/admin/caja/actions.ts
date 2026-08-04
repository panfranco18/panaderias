"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRolEnSucursal } from "@/lib/auth/current-perfil";
import { notificarVenta, notificarFaltante } from "@/lib/notificaciones";

export type ActionState = { error?: string; ok?: boolean };

const STAFF = ["superadmin", "encargado_sucursal", "empleado"] as const;

export async function registrarMovimientoCaja(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const sucursalId = String(formData.get("sucursal_id") || "");
  const tipo = String(formData.get("tipo") || "ingreso");
  const monto = Number(formData.get("monto") || 0);
  const descripcion = String(formData.get("descripcion") || "").trim() || null;

  if (!sucursalId) return { error: "Falta la sucursal" };
  if (!monto || monto <= 0) return { error: "El monto debe ser mayor a 0" };

  const auth = await requireRolEnSucursal([...STAFF], sucursalId);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("caja_movimientos").insert({
    sucursal_id: sucursalId,
    tipo,
    monto,
    descripcion,
    usuario_id: auth.perfil.id,
  });

  if (error) return { error: error.message };

  if (tipo === "ingreso") {
    const [{ data: sucursal }, { data: usuario }] = await Promise.all([
      supabase.from("sucursales").select("nombre").eq("id", sucursalId).maybeSingle(),
      supabase.from("perfiles").select("nombre").eq("id", auth.perfil.id).maybeSingle(),
    ]);

    await notificarVenta(supabase, {
      sucursalId,
      sucursalNombre: sucursal?.nombre ?? "",
      monto,
      descripcion,
      usuarioNombre: usuario?.nombre,
    });
  }

  revalidatePath("/admin/caja");
  return { ok: true };
}

export async function reportarFaltanteStock(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const sucursalId = String(formData.get("sucursal_id") || "");
  const categoria = String(formData.get("categoria") || "").trim();
  const descripcion = String(formData.get("descripcion") || "").trim();

  if (!sucursalId) return { error: "Falta la sucursal" };
  if (!categoria) return { error: "Elegí una categoría" };
  if (!descripcion) return { error: "Contá qué falta" };

  const auth = await requireRolEnSucursal([...STAFF], sucursalId);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();

  const { data: categoriaConfig } = await supabase
    .from("categorias_config")
    .select("permite_reportar_faltante")
    .eq("categoria", categoria)
    .maybeSingle();

  if (categoriaConfig && categoriaConfig.permite_reportar_faltante === false) {
    return { error: "No se pueden reportar faltantes en esta categoría." };
  }

  const [{ data: sucursal }, { data: usuario }] = await Promise.all([
    supabase.from("sucursales").select("nombre").eq("id", sucursalId).maybeSingle(),
    supabase.from("perfiles").select("nombre").eq("id", auth.perfil.id).maybeSingle(),
  ]);

  await notificarFaltante(supabase, {
    sucursalId,
    sucursalNombre: sucursal?.nombre ?? "",
    categoria,
    descripcion,
    usuarioNombre: usuario?.nombre,
  });

  revalidatePath("/admin/caja");
  return { ok: true };
}

export async function eliminarMovimientoCaja(id: string): Promise<ActionState> {
  const supabase = createAdminClient();

  const { data: movimiento } = await supabase
    .from("caja_movimientos")
    .select("sucursal_id")
    .eq("id", id)
    .maybeSingle();

  const auth = await requireRolEnSucursal(
    [...STAFF],
    movimiento?.sucursal_id ?? null
  );
  if ("error" in auth) return auth;

  const { error } = await supabase
    .from("caja_movimientos")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/caja");
  return { ok: true };
}
