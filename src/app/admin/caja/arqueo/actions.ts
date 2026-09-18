"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRolEnSucursal } from "@/lib/auth/current-perfil";
import { calcularArqueo } from "@/lib/arqueo-caja";
import { hoyISO } from "@/lib/fecha-ar";

export type ActionState = { error?: string; ok?: boolean };

const STAFF = ["superadmin", "encargado_sucursal", "empleado"] as const;

export async function guardarArqueo(
  sucursalId: string,
  efectivoContado: number,
  observaciones: string
): Promise<ActionState> {
  if (!sucursalId) return { error: "Falta la sucursal" };
  if (efectivoContado < 0) return { error: "El efectivo contado no puede ser negativo" };

  const auth = await requireRolEnSucursal([...STAFF], sucursalId);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const hoy = hoyISO();

  // Recalculado en el servidor (no se confía en los totales que mande el
  // cliente) — sólo el efectivo contado y las observaciones vienen del
  // formulario, el resto sale de la base al momento de guardar.
  const { comparacion } = await calcularArqueo(supabase, sucursalId, hoy);

  const totalValores =
    comparacion.valores.posnet +
    comparacion.valores.tarjeta +
    comparacion.valores.mercadopago +
    comparacion.valores.transferencias +
    comparacion.valores.depositos +
    comparacion.valores.gastos +
    efectivoContado;

  const diferencia = comparacion.ventas.total - totalValores;

  const { error } = await supabase.from("arqueos_caja").insert({
    sucursal_id: sucursalId,
    fecha: hoy,
    perfil_id: auth.perfil.id,
    ventas_negro: comparacion.ventas.negro,
    ventas_registradas: comparacion.ventas.registradas,
    ventas_sin_clasificar: comparacion.ventas.sinClasificar,
    total_ventas: comparacion.ventas.total,
    valor_posnet: comparacion.valores.posnet,
    valor_tarjeta: comparacion.valores.tarjeta,
    valor_mercadopago: comparacion.valores.mercadopago,
    valor_transferencias: comparacion.valores.transferencias,
    valor_depositos: comparacion.valores.depositos,
    valor_gastos: comparacion.valores.gastos,
    valor_efectivo_contado: efectivoContado,
    total_valores: totalValores,
    diferencia,
    observaciones: observaciones.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/caja/arqueo");
  return { ok: true };
}

export async function eliminarArqueo(id: string, sucursalId: string): Promise<ActionState> {
  const auth = await requireRolEnSucursal([...STAFF], sucursalId);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("arqueos_caja").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/caja/arqueo");
  return { ok: true };
}
