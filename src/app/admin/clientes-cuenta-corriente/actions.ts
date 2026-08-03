"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRol } from "@/lib/auth/current-perfil";

export type ActionState = { error?: string; ok?: boolean };

const PATH = "/admin/clientes-cuenta-corriente";

function campoTexto(formData: FormData, nombre: string) {
  return String(formData.get(nombre) || "").trim() || null;
}

export async function crearCliente(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const nombre = campoTexto(formData, "nombre");
  if (!nombre) return { error: "El nombre es obligatorio" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("clientes_cuenta_corriente").insert({
    nombre,
    cuit: campoTexto(formData, "cuit"),
    domicilio_fiscal: campoTexto(formData, "domicilio_fiscal"),
    responsable_iva: campoTexto(formData, "responsable_iva"),
    responsable_contacto: campoTexto(formData, "responsable_contacto"),
    telefono: campoTexto(formData, "telefono"),
  });

  if (error) return { error: error.message };

  revalidatePath(PATH);
  return { ok: true };
}

export async function actualizarCliente(
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
    .from("clientes_cuenta_corriente")
    .update({
      nombre,
      cuit: campoTexto(formData, "cuit"),
      domicilio_fiscal: campoTexto(formData, "domicilio_fiscal"),
      responsable_iva: campoTexto(formData, "responsable_iva"),
      responsable_contacto: campoTexto(formData, "responsable_contacto"),
      telefono: campoTexto(formData, "telefono"),
      activo: formData.get("activo") === "on",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(PATH);
  return { ok: true };
}

export async function eliminarCliente(id: string): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase.from("clientes_cuenta_corriente").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(PATH);
  return { ok: true };
}

export async function agregarMovimiento(
  clienteId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const detalle = campoTexto(formData, "detalle");
  const montoRetiro = Number(formData.get("monto_retiro") || 0);
  const montoPago = Number(formData.get("monto_pago") || 0);
  const fecha = campoTexto(formData, "fecha");

  if (!montoRetiro && !montoPago) {
    return { error: "Cargá un monto de retiro o de pago" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("clientes_cuenta_corriente_movimientos").insert({
    cliente_id: clienteId,
    fecha: fecha ?? undefined,
    detalle,
    monto_retiro: montoRetiro || 0,
    monto_pago: montoPago || 0,
  });

  if (error) return { error: error.message };

  revalidatePath(PATH);
  return { ok: true };
}

export async function eliminarMovimiento(id: string): Promise<ActionState> {
  const auth = await requireRol(["superadmin"]);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("clientes_cuenta_corriente_movimientos")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(PATH);
  return { ok: true };
}
