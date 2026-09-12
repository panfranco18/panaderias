"use client";

import Link from "next/link";
import { eliminarComprobante } from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { formatHoraAR } from "@/lib/fecha-ar";
import {
  TIPO_COMPROBANTE_LABEL,
  formatNumeroComprobante,
  type TipoComprobante,
} from "@/lib/comprobantes";

type Comprobante = {
  id: string;
  tipo: string;
  punto_venta: string;
  numero: number;
  cliente_nombre: string | null;
  total: number;
  fecha: string;
};

const TIPO_COLOR: Record<TipoComprobante, string> = {
  factura_a: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  factura_b: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  remito: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  presupuesto: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export function ComprobantesList({ comprobantes }: { comprobantes: Comprobante[] }) {
  if (comprobantes.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Sin comprobantes para esta fecha.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {comprobantes.map((c) => {
        const tipo = c.tipo as TipoComprobante;
        return (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_COLOR[tipo] ?? ""}`}>
                {TIPO_COMPROBANTE_LABEL[tipo] ?? c.tipo}
              </span>
              <div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {formatNumeroComprobante(c.punto_venta, c.numero)} —{" "}
                  {c.cliente_nombre || "Consumidor Final"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatHoraAR(c.fecha)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                ${Number(c.total).toFixed(2)}
              </p>
              <Link
                href={`/admin/facturacion/${c.id}`}
                className="rounded-md px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
              >
                Ver
              </Link>
              <DeleteButton
                action={() => eliminarComprobante(c.id)}
                label="Eliminar comprobante"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
