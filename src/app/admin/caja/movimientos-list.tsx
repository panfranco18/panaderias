"use client";

import { eliminarMovimientoCaja } from "./actions";
import { DeleteButton } from "@/components/delete-button";

type Movimiento = {
  id: string;
  tipo: string;
  monto: number;
  descripcion: string | null;
  fecha: string;
};

const TIPO_COLOR: Record<string, string> = {
  apertura: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  ingreso: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  egreso: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  cierre: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
};

export function MovimientosList({ movimientos }: { movimientos: Movimiento[] }) {
  if (movimientos.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Sin movimientos de caja para esta fecha.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {movimientos.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_COLOR[m.tipo]}`}
            >
              {m.tipo}
            </span>
            <div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {m.descripcion || "—"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {new Date(m.fecha).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              ${Number(m.monto).toFixed(2)}
            </p>
            <DeleteButton
              action={() => eliminarMovimientoCaja(m.id)}
              label="Eliminar movimiento"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
