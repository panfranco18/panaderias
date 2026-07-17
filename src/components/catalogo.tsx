"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { IconPackage } from "@/components/admin-icons";

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

  useEffect(() => {
    if (!sucursalId && sucursales.length > 0) {
      setSucursalId(sucursales[0].id);
    }
  }, [sucursalId, sucursales, setSucursalId]);

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

      <div className="flex flex-col gap-10">
        {Object.entries(porCategoria).map(([categoria, items]) => (
          <div key={categoria}>
            <h3 className="mb-4 text-sm font-bold tracking-wide text-amber-700 uppercase dark:text-amber-400">
              {categoria}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((producto) => (
                <div
                  key={producto.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-amber-200 bg-[#f5ead9] dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="relative h-32 w-full bg-amber-100 dark:bg-zinc-800">
                    {producto.imagen_url ? (
                      <Image
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-amber-300 dark:text-zinc-600">
                        <IconPackage className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4 text-center">
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                      {producto.nombre}
                    </h4>
                    {producto.descripcion && (
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {producto.descripcion}
                      </p>
                    )}
                    <p className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">
                      ${precioDe(producto).toFixed(2)}
                      <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        {UNIDAD_LABEL[producto.unidad_medida ?? "unidad"]}
                      </span>
                    </p>
                    <button
                      onClick={() =>
                        addItem({
                          productoId: producto.id,
                          nombre: producto.nombre,
                          precioUnitario: precioDe(producto),
                          unidadMedida: producto.unidad_medida ?? "unidad",
                        })
                      }
                      className="mt-3 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
