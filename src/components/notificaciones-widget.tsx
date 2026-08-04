"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  IconBell,
  IconAlertTriangle,
  IconTag,
  IconReceipt,
} from "@/components/admin-icons";

function iconoNotificacion(tipo: string) {
  if (tipo === "stock_bajo") return { Icon: IconAlertTriangle, color: "text-red-600 dark:text-red-400" };
  if (tipo === "faltante_reportado") return { Icon: IconAlertTriangle, color: "text-orange-600 dark:text-orange-400" };
  if (tipo === "venta_registrada") return { Icon: IconReceipt, color: "text-green-600 dark:text-green-400" };
  return { Icon: IconTag, color: "text-amber-600 dark:text-amber-400" };
}
import {
  marcarNotificacionLeida,
  marcarTodasLeidas,
} from "@/app/admin/notificaciones/actions";

type Notificacion = {
  id: string;
  tipo: string;
  mensaje: string;
  created_at: string;
};

export function NotificacionesWidget({
  notificaciones,
}: {
  notificaciones: Notificacion[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [items, setItems] = useState(notificaciones);
  const [, startTransition] = useTransition();

  function dismiss(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
    startTransition(() => {
      marcarNotificacionLeida(id);
    });
  }

  function dismissAll() {
    setItems([]);
    startTransition(() => {
      marcarTodasLeidas();
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Notificaciones"
        className="relative flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <IconBell className="h-5 w-5" />
        Notificaciones
        {items.length > 0 && (
          <span className="absolute right-2 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute bottom-full left-0 z-50 mb-1 w-[min(20rem,85vw)] rounded-lg border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Notificaciones
            </p>
            {items.length > 0 && (
              <button
                onClick={dismissAll}
                className="text-xs font-medium text-amber-700 hover:underline dark:text-amber-400"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              No hay novedades.
            </p>
          ) : (
            <ul className="mt-2 flex max-h-80 flex-col gap-1.5 overflow-y-auto">
              {items.map((n) => {
                const { Icon, color } = iconoNotificacion(n.tipo);
                return (
                  <li
                    key={n.id}
                    className="flex items-start gap-2 rounded-md p-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
                    <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                      {n.mensaje}
                    </span>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="shrink-0 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/admin/notificaciones"
            onClick={() => setAbierto(false)}
            className="mt-3 block text-center text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Ver historial completo
          </Link>
        </div>
      )}
    </div>
  );
}
