"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { IconPackage, IconX } from "@/components/admin-icons";
import { IconTongs } from "@/components/icons";
import { dispatchFlyToCart } from "@/lib/fly-to-cart";
import { iconoDeCategoria, gradienteDeCategoria } from "@/lib/categoria-visual";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  imagen_url: string | null;
  precio_base: number;
  unidad_medida?: string;
};

const UNIDAD_LABEL: Record<string, string> = {
  unidad: "",
  kg: "/kg",
  gramo: "/g",
  docena: "/docena",
};

type Precio = { producto_id: string; sucursal_id: string; precio: number };
type Sucursal = { id: string; nombre: string };

export function Catalogo({
  productos,
  precios,
  sucursales,
}: {
  productos: Producto[];
  precios: Precio[];
  sucursales: Sucursal[];
}) {
  const { sucursalId, setSucursalId, addItem } = useCart();
  const [categoriaAbierta, setCategoriaAbierta] = useState<string | null>(null);

  useEffect(() => {
    if (!sucursalId && sucursales.length > 0) {
      setSucursalId(sucursales[0].id);
    }
  }, [sucursalId, sucursales, setSucursalId]);

  useEffect(() => {
    if (!categoriaAbierta) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setCategoriaAbierta(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [categoriaAbierta]);

  if (productos.length === 0) {
    return (
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no cargamos productos. Volvé pronto.
      </p>
    );
  }

  function precioDe(producto: Producto) {
    if (sucursalId) {
      const override = precios.find(
        (p) => p.producto_id === producto.id && p.sucursal_id === sucursalId
      );
      if (override) return override.precio;
    }
    return producto.precio_base;
  }

  const porCategoria = productos.reduce<Record<string, Producto[]>>(
    (acc, p) => {
      (acc[p.categoria] ??= []).push(p);
      return acc;
    },
    {}
  );

  function agregarAlCarrito(e: React.MouseEvent<HTMLButtonElement>, producto: Producto) {
    const rect = e.currentTarget.getBoundingClientRect();
    dispatchFlyToCart(
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      producto.categoria
    );
    addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      precioUnitario: precioDe(producto),
      unidadMedida: producto.unidad_medida ?? "unidad",
      categoria: producto.categoria,
    });
  }

  return (
    <div>
      {sucursales.length > 0 && (
        <div className="mx-auto mb-8 flex max-w-xs items-center gap-2">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">
            Retiro en:
          </label>
          <select
            value={sucursalId ?? ""}
            onChange={(e) => setSucursalId(e.target.value)}
            className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(porCategoria).map(([categoria, items]) => {
          const Icon = iconoDeCategoria(categoria);
          const gradiente = gradienteDeCategoria(categoria);
          return (
            <button
              key={categoria}
              onClick={() => setCategoriaAbierta(categoria)}
              className={`group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br ${gradiente} p-4 text-center text-white shadow-md transition-transform hover:scale-[1.03] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300`}
            >
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              <Icon className="h-12 w-12 drop-shadow-sm sm:h-14 sm:w-14" />
              <span className="font-[family-name:var(--font-playfair)] text-base font-bold sm:text-lg">
                {categoria}
              </span>
              <span className="text-xs text-white/80">
                {items.length} producto{items.length === 1 ? "" : "s"}
              </span>
            </button>
          );
        })}
      </div>

      {categoriaAbierta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setCategoriaAbierta(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#f5ead9] p-6 shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {categoriaAbierta}
              </h3>
              <button
                onClick={() => setCategoriaAbierta(null)}
                aria-label="Cerrar"
                className="rounded-full p-2 text-zinc-500 hover:bg-black/5 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {porCategoria[categoriaAbierta].map((producto) => (
                <div
                  key={producto.id}
                  className="flex items-center gap-4 rounded-xl border border-amber-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-amber-100 dark:bg-zinc-800">
                    {producto.imagen_url ? (
                      <Image
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-amber-300 dark:text-zinc-600">
                        <IconPackage className="h-7 w-7" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-zinc-800 dark:text-zinc-100">
                      {producto.nombre}
                    </p>
                    {producto.descripcion && (
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {producto.descripcion}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      ${precioDe(producto).toFixed(2)}
                      <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        {UNIDAD_LABEL[producto.unidad_medida ?? "unidad"]}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={(e) => agregarAlCarrito(e, producto)}
                    aria-label={`Agregar ${producto.nombre} a la canasta`}
                    title="Agregar a la canasta"
                    className="flex h-11 w-11 shrink-0 -rotate-45 items-center justify-center rounded-full bg-amber-600 text-white shadow transition-transform hover:scale-110 hover:bg-amber-700 active:scale-95"
                  >
                    <IconTongs className="h-6 w-6 rotate-45" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
