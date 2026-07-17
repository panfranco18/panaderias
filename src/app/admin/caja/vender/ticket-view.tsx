"use client";

import { useState } from "react";
import type { VentaCreada } from "./actions";

const UNIDAD_LABEL: Record<string, string> = {
  unidad: "",
  kg: "kg",
  gramo: "g",
  docena: "doc.",
};

function etiquetaCantidad(cantidad: number, unidadMedida?: string) {
  const unidad = UNIDAD_LABEL[unidadMedida ?? "unidad"];
  return unidad ? `${cantidad}${unidad}` : `${cantidad}`;
}

export function TicketView({
  venta,
  onNuevaVenta,
}: {
  venta: VentaCreada;
  onNuevaVenta: () => void;
}) {
  const [modo, setModo] = useState<"ticket" | "comanda">("ticket");

  function imprimir(tipo: "ticket" | "comanda") {
    setModo(tipo);
    setTimeout(() => window.print(), 50);
  }

  return (
    <div className="mt-6">
      <div className="no-print flex flex-wrap items-center gap-2">
        <button
          onClick={() => imprimir("ticket")}
          className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Imprimir ticket
        </button>
        <button
          onClick={() => imprimir("comanda")}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Imprimir comanda
        </button>
        <button
          onClick={onNuevaVenta}
          className="ml-auto rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Nueva venta
        </button>
      </div>

      <div
        id="ticket-imprimible"
        className="mx-auto mt-4 w-full max-w-xs rounded-lg border border-zinc-200 bg-white p-4 font-mono text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
      >
        <p className="text-center font-bold">Panadería</p>
        <p className="text-center">{venta.sucursalNombre}</p>
        <p className="mt-1 text-center">
          {new Date(venta.fecha).toLocaleString("es-AR")}
        </p>
        <div className="my-2 border-t border-dashed border-zinc-400" />

        {modo === "ticket" ? (
          <>
            {venta.items.map((it) => (
              <div key={it.productoId} className="flex justify-between">
                <span>
                  {etiquetaCantidad(it.cantidad, it.unidadMedida)} x {it.nombre}
                </span>
                <span>${(it.cantidad * it.precioUnitario).toFixed(2)}</span>
              </div>
            ))}
            <div className="my-2 border-t border-dashed border-zinc-400" />
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>${venta.total.toFixed(2)}</span>
            </div>
            <p className="mt-1">
              Pago: {venta.metodoPago ?? "sin especificar"}
            </p>
          </>
        ) : (
          <>
            <p className="text-center font-bold">COMANDA</p>
            <div className="my-2 border-t border-dashed border-zinc-400" />
            {venta.items.map((it) => (
              <div key={it.productoId} className="py-0.5">
                {etiquetaCantidad(it.cantidad, it.unidadMedida)} x {it.nombre}
              </div>
            ))}
          </>
        )}

        <div className="my-2 border-t border-dashed border-zinc-400" />
        <p className="text-center">¡Gracias por su compra!</p>
      </div>
    </div>
  );
}
