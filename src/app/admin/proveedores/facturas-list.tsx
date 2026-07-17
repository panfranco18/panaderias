"use client";

import { eliminarFacturaProveedor } from "./actions";
import { IconReceipt } from "@/components/admin-icons";
import { DeleteButton } from "@/components/delete-button";

type Factura = {
  id: string;
  proveedor_id: string | null;
  sucursal_id: string | null;
  numero_factura: string | null;
  monto: number;
  fecha: string;
  imagen_signed_url: string | null;
};

export function FacturasList({
  facturas,
  proveedores,
  sucursales,
}: {
  facturas: Factura[];
  proveedores: { id: string; nombre: string }[];
  sucursales: { id: string; nombre: string }[];
}) {
  if (facturas.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay facturas de proveedores cargadas.
      </p>
    );
  }

  const nombreProveedor = (id: string | null) =>
    proveedores.find((p) => p.id === id)?.nombre ?? "Sin proveedor";
  const nombreSucursal = (id: string | null) =>
    sucursales.find((s) => s.id === id)?.nombre ?? "Sin sucursal";

  return (
    <div className="flex flex-col gap-2">
      {facturas.map((f) => (
        <div
          key={f.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-3">
            {f.imagen_signed_url ? (
              <a href={f.imagen_signed_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={f.imagen_signed_url}
                  alt="Comprobante"
                  className="h-12 w-12 rounded-md object-cover"
                />
              </a>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-50 text-amber-300 dark:bg-zinc-800 dark:text-zinc-600">
                <IconReceipt className="h-6 w-6" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {nombreProveedor(f.proveedor_id)}
                {f.numero_factura ? ` · ${f.numero_factura}` : ""}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {nombreSucursal(f.sucursal_id)} · {f.fecha}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              ${Number(f.monto).toFixed(2)}
            </p>
            <DeleteButton
              action={() => eliminarFacturaProveedor(f.id)}
              label="Eliminar factura"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
