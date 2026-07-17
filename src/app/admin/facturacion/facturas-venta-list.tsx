"use client";

import { eliminarFacturaVenta } from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { IconReceipt } from "@/components/admin-icons";

type Factura = {
  id: string;
  venta_id: string | null;
  numero: string | null;
  cuit_cliente: string | null;
  monto: number;
  fecha: string;
};

export function FacturasVentaList({ facturas }: { facturas: Factura[] }) {
  if (facturas.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay facturas cargadas para esta fecha.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {facturas.map((f) => (
        <div
          key={f.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-400 dark:bg-zinc-800 dark:text-zinc-600">
              <IconReceipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {f.numero || "Sin número"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {f.cuit_cliente || "Consumidor final"} ·{" "}
                {new Date(f.fecha).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              ${Number(f.monto).toFixed(2)}
            </p>
            <DeleteButton
              action={() => eliminarFacturaVenta(f.id, f.venta_id)}
              label="Eliminar factura"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
