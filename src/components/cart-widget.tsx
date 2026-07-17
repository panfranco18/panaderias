"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { IconTrash } from "@/components/admin-icons";
import { IconBasket } from "@/components/icons";
import { FLY_TO_CART_EVENT, type FlyToCartDetail } from "@/lib/fly-to-cart";
import { iconoDeCategoria } from "@/lib/categoria-visual";

const UNIDAD_LABEL: Record<string, string> = {
  unidad: "",
  kg: "kg",
  gramo: "g",
  docena: "doc.",
};

function esFraccionable(unidad?: string) {
  return unidad === "kg" || unidad === "gramo";
}

type FlyingItem = {
  id: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  categoria: string;
  landed: boolean;
};

export function CartWidget() {
  const pathname = usePathname();
  const { items, updateCantidad, removeItem, total, cantidadTotal } = useCart();
  const [abierto, setAbierto] = useState(false);
  const [flying, setFlying] = useState<FlyingItem[]>([]);
  const [rebote, setRebote] = useState(false);
  const basketRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onFly(e: Event) {
      const detail = (e as CustomEvent<FlyToCartDetail>).detail;
      const basket = basketRef.current?.getBoundingClientRect();
      if (!basket) return;

      const id = Date.now() + Math.random();
      const to = { x: basket.left + basket.width / 2, y: basket.top + basket.height / 2 };

      setFlying((prev) => [...prev, { id, from: detail.from, to, categoria: detail.categoria, landed: false }]);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlying((prev) =>
            prev.map((f) => (f.id === id ? { ...f, landed: true } : f))
          );
        });
      });

      setTimeout(() => {
        setFlying((prev) => prev.filter((f) => f.id !== id));
        setRebote(true);
        setTimeout(() => setRebote(false), 300);
      }, 650);
    }

    window.addEventListener(FLY_TO_CART_EVENT, onFly);
    return () => window.removeEventListener(FLY_TO_CART_EVENT, onFly);
  }, []);

  const categoriasEnCarrito = useMemo(() => {
    const vistas = new Set<string>();
    const orden: string[] = [];
    for (const it of items) {
      const cat = it.categoria ?? "Otros";
      if (!vistas.has(cat)) {
        vistas.add(cat);
        orden.push(cat);
      }
    }
    return orden;
  }, [items]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <>
      {flying.map((f) => {
        const Icon = iconoDeCategoria(f.categoria);
        const pos = f.landed ? f.to : f.from;
        return (
          <div
            key={f.id}
            className="pointer-events-none fixed z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg transition-all duration-[600ms] ease-in"
            style={{
              left: pos.x,
              top: pos.y,
              transform: `translate(-50%, -50%) scale(${f.landed ? 0.25 : 1})`,
              opacity: f.landed ? 0 : 1,
            }}
          >
            <Icon className="h-5 w-5" />
          </div>
        );
      })}

      <div className="fixed bottom-5 right-5 z-50">
        {abierto && (
          <div className="mb-3 w-80 rounded-lg border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              Tu canasta
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
          ref={basketRef}
          onClick={() => setAbierto((v) => !v)}
          className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg transition-transform hover:bg-amber-700 ${rebote ? "scale-110" : "scale-100"}`}
          aria-label="Ver canasta"
        >
          <IconBasket className="h-8 w-8" />

          {categoriasEnCarrito.length > 0 && (
            <div className="absolute -top-2 left-1/2 flex -translate-x-1/2 gap-0.5">
              {categoriasEnCarrito.slice(0, 3).map((cat) => {
                const Icon = iconoDeCategoria(cat);
                return (
                  <span
                    key={cat}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-amber-700 ring-2 ring-amber-600"
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                );
              })}
            </div>
          )}

          {cantidadTotal > 0 && (
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 text-xs font-bold text-white dark:border-zinc-950">
              {cantidadTotal}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
