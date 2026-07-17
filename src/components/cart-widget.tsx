"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { IconTrash } from "@/components/admin-icons";

const UNIDAD_LABEL: Record<string, string> = {
  unidad: "",
  kg: "kg",
  gramo: "g",
  docena: "doc.",
};

function esFraccionable(unidad?: string) {
  return unidad === "kg" || unidad === "gramo";
}

export function CartWidget() {
  const pathname = usePathname();
  const { items, updateCantidad, removeItem, total, cantidadTotal } = useCart();
  const [abierto, setAbierto] = useState(false);

  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {abierto && (
        <div className="mb-3 w-80 rounded-lg border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            Tu pedido
          </p>
          {items.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Todavía no agregaste productos.
            </p>
          ) : (
            <>
              <ul className="mt-3 flex max-h-64 flex-col gap-2 overflow-y-auto">
                {items.map((it) => (
                  <li
                    key={it.productoId}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                      {it.nombre}
                    </span>
                    <input
                      type="number"
                      min={esFraccionable(it.unidadMedida) ? "0.01" : "1"}
                      step={esFraccionable(it.unidadMedida) ? "0.01" : "1"}
                      value={it.cantidad}
                      onChange={(e) =>
                        updateCantidad(it.productoId, Number(e.target.value))
                      }
                      className="w-14 rounded-md border border-zinc-300 px-1.5 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                    />
                    {it.unidadMedida && it.unidadMedida !== "unidad" && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {UNIDAD_LABEL[it.unidadMedida]}
                      </span>
                    )}
                    <span className="w-16 text-right text-zinc-900 dark:text-zinc-50">
                      ${(it.precioUnitario * it.cantidad).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(it.productoId)}
                      aria-label="Quitar"
                      className="text-zinc-400 hover:text-red-600"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className="mt-3 block rounded-full bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-amber-700"
              >
                Finalizar pedido
              </Link>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setAbierto((v) => !v)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg hover:bg-amber-700"
        aria-label="Ver carrito"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="20" r="1.5" fill="currentColor" />
          <circle cx="17" cy="20" r="1.5" fill="currentColor" />
        </svg>
        {cantidadTotal > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {cantidadTotal}
          </span>
        )}
      </button>
    </div>
  );
}
