"use client";

import { useTransition } from "react";
import { IconAlertTriangle, IconTag, IconReceipt } from "@/components/admin-icons";
import { marcarNotificacionLeida } from "./actions";

function iconoNotificacion(tipo: string) {
  if (tipo === "stock_bajo") return { Icon: IconAlertTriangle, color: "text-red-600 dark:text-red-400" };
  if (tipo === "faltante_reportado") return { Icon: IconAlertTriangle, color: "text-orange-600 dark:text-orange-400" };
  if (tipo === "venta_registrada") return { Icon: IconReceipt, color: "text-green-600 dark:text-green-400" };
  return { Icon: IconTag, color: "text-amber-600 dark:text-amber-400" };
}

type Notificacion = {
  id: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  sucursal_id: string | null;
  created_at: string;
};

export function NotificacionesList({
  notificaciones,
  sucursales,
}: {
  notificaciones: Notificacion[];
  sucursales: { id: string; nombre: string }[];
}) {
  const [, startTransition] = useTransition();

  if (notificaciones.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No hay notificaciones todavía.
      </p>
    );
  }

  const sucursalNombre = (id: string | null) =>
    id ? (sucursales.find((s) => s.id === id)?.nombre ?? "Sucursal") : "Todas las sucursales";

  return (
    <ul className="flex flex-col gap-2">
      {notificaciones.map((n) => {
        const { Icon, color } = iconoNotificacion(n.tipo);
        return (
          <li
            key={n.id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              n.leida
                ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                : "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
            }`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-800 dark:text-zinc-200">{n.mensaje}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {sucursalNombre(n.sucursal_id)} ·{" "}
                {new Date(n.created_at).toLocaleString("es-AR")}
              </p>
            </div>
            {!n.leida && (
              <button
                onClick={() =>
                  startTransition(() => {
                    marcarNotificacionLeida(n.id);
                  })
                }
                className="shrink-0 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Marcar leída
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
