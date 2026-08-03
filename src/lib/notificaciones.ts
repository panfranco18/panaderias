import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type Supabase = ReturnType<typeof createAdminClient>;

export async function notificarCambioPrecio(
  supabase: Supabase,
  params: {
    productoId: string;
    nombre: string;
    precioAnterior: number;
    precioNuevo: number;
    sucursalId?: string | null;
    sucursalNombre?: string | null;
  }
) {
  const { productoId, nombre, precioAnterior, precioNuevo, sucursalId, sucursalNombre } = params;
  if (precioAnterior === precioNuevo) return;

  const alcance = sucursalId && sucursalNombre ? ` en ${sucursalNombre}` : " (todas las sucursales)";
  const mensaje = `Cambió el precio de "${nombre}"${alcance}: $${precioAnterior.toFixed(2)} → $${precioNuevo.toFixed(2)}. Actualizá el precio en el mostrador.`;

  await supabase.from("notificaciones").insert({
    tipo: "cambio_precio",
    producto_id: productoId,
    sucursal_id: sucursalId ?? null,
    precio_anterior: precioAnterior,
    precio_nuevo: precioNuevo,
    mensaje,
  });
}

export async function revisarStockBajo(
  supabase: Supabase,
  params: { productoId: string; sucursalId: string; cantidadNueva: number }
) {
  const { productoId, sucursalId, cantidadNueva } = params;

  const { data: producto } = await supabase
    .from("productos")
    .select("nombre, stock_minimo")
    .eq("id", productoId)
    .maybeSingle();

  if (!producto || !producto.stock_minimo || producto.stock_minimo <= 0) return;

  if (cantidadNueva <= producto.stock_minimo) {
    const { data: existente } = await supabase
      .from("notificaciones")
      .select("id")
      .eq("tipo", "stock_bajo")
      .eq("producto_id", productoId)
      .eq("sucursal_id", sucursalId)
      .eq("leida", false)
      .maybeSingle();

    const mensaje = `Stock bajo: "${producto.nombre}" — quedan ${cantidadNueva} (mínimo ${producto.stock_minimo}).`;

    if (existente) {
      await supabase
        .from("notificaciones")
        .update({ cantidad_actual: cantidadNueva, mensaje, created_at: new Date().toISOString() })
        .eq("id", existente.id);
    } else {
      await supabase.from("notificaciones").insert({
        tipo: "stock_bajo",
        producto_id: productoId,
        sucursal_id: sucursalId,
        cantidad_actual: cantidadNueva,
        mensaje,
      });
    }
  } else {
    // volvió a estar por encima del mínimo: las alertas viejas ya no aplican
    await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("tipo", "stock_bajo")
      .eq("producto_id", productoId)
      .eq("sucursal_id", sucursalId)
      .eq("leida", false);
  }
}
