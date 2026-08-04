"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRolEnSucursal } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function declararStockDiario(
  sucursalId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRolEnSucursal(
    ["superadmin", "encargado_sucursal"],
    sucursalId
  );
  if ("error" in auth) return auth;

  const filas: {
    sucursal_id: string;
    categoria: string;
    fecha: string;
    cantidad_inicial: number;
    perfil_id: string;
  }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("cantidad_")) continue;
    const categoria = key.slice("cantidad_".length);
    const texto = String(value).trim();
    if (!texto) continue;
    const cantidad = Number(texto);
    if (Number.isNaN(cantidad) || cantidad < 0) continue;
    filas.push({
      sucursal_id: sucursalId,
      categoria,
      fecha: hoyISO(),
      cantidad_inicial: cantidad,
      perfil_id: auth.perfil.id,
    });
  }

  if (filas.length === 0) return { error: "Ingresá al menos una cantidad" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("stock_diario_categoria")
    .upsert(filas, { onConflict: "sucursal_id,categoria,fecha" });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}
