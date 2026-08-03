"use client";

import { eliminarGasto } from "./actions";
import { DeleteButton } from "@/components/delete-button";

type Gasto = {
  id: string;
  categoria: string;
  fecha: string | null;
  detalle: string | null;
  monto: number | null;
  vencimiento: string | null;
  fecha_pago: string | null;
  otros: string | null;
};

function formatearFecha(f: string | null) {
  if (!f) return null;
  return new Date(f + "T00:00:00").toLocaleDateString("es-AR");
}

export function GastosList({ gastos }: { gastos: Gasto[] }) {
  if (gastos.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay gastos cargados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {gastos.map((g) => (
        <div
          key={g.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {g.categoria}
              {g.detalle && (
                <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                  {g.detalle}
                </span>
              )}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {[
                formatearFecha(g.fecha) && `Fecha: ${formatearFecha(g.fecha)}`,
                formatearFecha(g.vencimiento) && `Vence: ${formatearFecha(g.vencimiento)}`,
                formatearFecha(g.fecha_pago) && `Pagado: ${formatearFecha(g.fecha_pago)}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {g.monto != null && (
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                ${Number(g.monto).toFixed(2)}
              </span>
            )}
            <DeleteButton action={() => eliminarGasto(g.id)} label="Eliminar gasto" />
          </div>
        </div>
      ))}
    </div>
  );
}
