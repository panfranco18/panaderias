import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatHoraAR } from "@/lib/fecha-ar";

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

export async function notificarVenta(
  supabase: Supabase,
  params: {
    sucursalId: string;
    sucursalNombre: string;
    monto: number;
    descripcion?: string | null;
    usuarioNombre?: string | null;
  }
) {
  const { sucursalId, sucursalNombre, monto, descripcion, usuarioNombre } = params;
  const quien = usuarioNombre ? ` (${usuarioNombre})` : "";
  const detalle = descripcion ? ` — ${descripcion}` : "";
  const mensaje = `Ingreso de caja en ${sucursalNombre}${quien}: $${monto.toFixed(2)}${detalle}`;

  await supabase.from("notificaciones").insert({
    tipo: "venta_registrada",
    sucursal_id: sucursalId,
    mensaje,
  });
}

export async function notificarFaltante(
  supabase: Supabase,
  params: {
    sucursalId: string;
    sucursalNombre: string;
    categoria: string;
    descripcion: string;
    usuarioNombre?: string | null;
  }
) {
  const { sucursalId, sucursalNombre, categoria, descripcion, usuarioNombre } = params;
  const quien = usuarioNombre ? ` (${usuarioNombre})` : "";
  const mensaje = `Faltante reportado en ${sucursalNombre}${quien} — ${categoria}: ${descripcion}`;

  await supabase.from("notificaciones").insert({
    tipo: "faltante_reportado",
    sucursal_id: sucursalId,
    mensaje,
  });
}

export async function notificarFichaje(
  supabase: Supabase,
  params: {
    tipo: "entrada" | "salida";
    sucursalId: string;
    sucursalNombre: string;
    nombreEmpleado: string;
    hora: string;
  }
) {
  const { tipo, sucursalId, sucursalNombre, nombreEmpleado, hora } = params;
  const accion = tipo === "entrada" ? "ingresó al sistema" : "se retiró";
  const mensaje = `${nombreEmpleado} (${sucursalNombre}) ${accion} a las ${formatHoraAR(hora)}.`;

  await supabase.from("notificaciones").insert({
    tipo: "fichaje",
    sucursal_id: sucursalId,
    mensaje,
  });
}

export async function notificarCierreTurno(
  supabase: Supabase,
  params: {
    tipo: "x" | "z";
    sucursalId: string;
    sucursalNombre: string;
    nombreEmpleado: string;
    hora: string;
    totalVentas: number;
    saldo: number;
  }
) {
  const { tipo, sucursalId, sucursalNombre, nombreEmpleado, hora, totalVentas, saldo } = params;
  const etiqueta = tipo === "x" ? "Cierre X (turno mañana)" : "Cierre Z (cierre del día)";
  const mensaje = `${etiqueta} en ${sucursalNombre} — ${nombreEmpleado} a las ${formatHoraAR(hora)}. Vendido: $${totalVentas.toFixed(2)}, saldo en caja: $${saldo.toFixed(2)}.`;

  await supabase.from("notificaciones").insert({
    tipo: tipo === "x" ? "cierre_x" : "cierre_z",
    sucursal_id: sucursalId,
    mensaje,
  });
}

export async function notificarCierreDemorado(
  supabase: Supabase,
  params: {
    sucursalId: string;
    sucursalNombre: string;
    nombreEmpleado: string;
    horaFinTurno: string;
  }
) {
  const { sucursalId, sucursalNombre, nombreEmpleado, horaFinTurno } = params;
  const mensaje = `${nombreEmpleado} (${sucursalNombre}) todavía no hizo el Cierre X — el turno mañana termina a las ${horaFinTurno.slice(0, 5)}, puede que lo haga un poco más tarde.`;

  await supabase.from("notificaciones").insert({
    tipo: "cierre_demorado",
    sucursal_id: sucursalId,
    mensaje,
  });
}

export async function notificarDeposito(
  supabase: Supabase,
  params: {
    sucursalId: string;
    sucursalNombre: string;
    nombreEmpleado: string;
    monto: number;
  }
) {
  const { sucursalId, sucursalNombre, nombreEmpleado, monto } = params;
  const mensaje = `${nombreEmpleado} (${sucursalNombre}) depositó $${monto.toFixed(2)} del efectivo de hoy.`;

  await supabase.from("notificaciones").insert({
    tipo: "deposito",
    sucursal_id: sucursalId,
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
