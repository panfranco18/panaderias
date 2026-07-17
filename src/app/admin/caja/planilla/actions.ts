"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRolEnSucursal } from "@/lib/auth/current-perfil";

const STAFF = ["superadmin", "encargado_sucursal", "empleado"] as const;

export type FilaPlanilla = {
  producto: string;
  cantidad: number;
  precioUnitario: number;
};

export type AnalizarResult =
  | { error: string }
  | { ok: true; filas: FilaPlanilla[]; imagenPath: string };

export async function analizarPlanilla(input: {
  sucursalId: string;
  imagenBase64: string;
  mimeType: string;
}): Promise<AnalizarResult> {
  if (!input.sucursalId) return { error: "Falta la sucursal" };

  const auth = await requireRolEnSucursal([...STAFF], input.sucursalId);
  if ("error" in auth) return auth;

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      error:
        "Falta configurar ANTHROPIC_API_KEY en .env.local para poder leer la planilla.",
    };
  }

  const supabase = createAdminClient();

  const buffer = Buffer.from(input.imagenBase64, "base64");
  const ext = input.mimeType.split("/")[1] || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("planillas-ventas")
    .upload(path, buffer, { contentType: input.mimeType });

  if (uploadError) return { error: uploadError.message };

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let filas: FilaPlanilla[];
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: input.mimeType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: input.imagenBase64,
              },
            },
            {
              type: "text",
              text: 'Esta es una foto de una planilla de ventas escrita a mano de una panadería. Cada fila tiene: nombre del producto, cantidad vendida, y precio unitario. Devolvé SOLO un JSON válido (sin texto adicional, sin markdown, sin explicaciones) con este formato exacto: [{"producto": "nombre tal cual está escrito", "cantidad": numero, "precioUnitario": numero}]. Si no podés leer algún valor con confianza, poné 0 en el número, pero incluí la fila igual. No inventes filas que no estén en la imagen.',
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    filas = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? `No se pudo leer la planilla: ${e.message}`
          : "No se pudo leer la planilla",
    };
  }

  return { ok: true, filas, imagenPath: path };
}

export async function confirmarPlanilla(input: {
  sucursalId: string;
  imagenPath: string | null;
  items: { productoId: string; cantidad: number; precioUnitario: number }[];
}): Promise<{ error: string } | { ok: true }> {
  if (!input.items.length) return { error: "No hay items para guardar" };

  const auth = await requireRolEnSucursal([...STAFF], input.sucursalId);
  if ("error" in auth) return auth;

  const supabase = createAdminClient();
  const total = input.items.reduce(
    (acc, it) => acc + it.cantidad * it.precioUnitario,
    0
  );

  const { data: venta, error: ventaError } = await supabase
    .from("ventas")
    .insert({
      sucursal_id: input.sucursalId,
      origen: "escaneo",
      usuario_id: auth.perfil.id,
      total,
      planilla_imagen_url: input.imagenPath,
    })
    .select()
    .single();

  if (ventaError) return { error: ventaError.message };

  const itemsPayload = input.items.map((it) => ({
    venta_id: venta.id,
    producto_id: it.productoId,
    cantidad: it.cantidad,
    precio_unitario: it.precioUnitario,
  }));

  const { error: itemsError } = await supabase
    .from("items_venta")
    .insert(itemsPayload);

  if (itemsError) return { error: itemsError.message };

  const { error: cajaError } = await supabase.from("caja_movimientos").insert({
    sucursal_id: input.sucursalId,
    tipo: "ingreso",
    monto: total,
    descripcion: "Venta (planilla escaneada)",
    usuario_id: auth.perfil.id,
  });

  if (cajaError) return { error: cajaError.message };

  revalidatePath("/admin/caja");
  revalidatePath("/admin");
  return { ok: true };
}
