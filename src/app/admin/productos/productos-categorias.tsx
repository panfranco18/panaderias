"use client";

import { useState } from "react";
import { ProductosList } from "./productos-list";
import { IconX } from "@/components/admin-icons";
import {
  iconoDeCategoria,
  gradienteDeCategoria,
  ordenarCategorias,
} from "@/lib/categoria-visual";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  imagen_url: string | null;
  precio_base: number;
  activo: boolean;
  codigo_barras?: string | null;
  unidad_medida?: string;
  stock_minimo?: number;
};

type PrecioSucursal = { producto_id: string; sucursal_id: string; precio: number };

export function ProductosCategorias({
  productos,
  sucursales,
  precios,
}: {
  productos: Producto[];
  sucursales: { id: string; nombre: string }[];
  precios: PrecioSucursal[];
}) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaAbierta, setCategoriaAbierta] = useState<string | null>(null);

  const porCategoria = productos.reduce<Record<string, Producto[]>>((acc, p) => {
    (acc[p.categoria] ??= []).push(p);
    return acc;
  }, {});
  const categoriasOrdenadas = ordenarCategorias(Object.keys(porCategoria));

  const resultadosBusqueda = busqueda.trim()
    ? productos.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
      )
    : [];

  return (
    <div>
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar producto en todas las categorías..."
        className="w-full max-w-md rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />

      {busqueda.trim() ? (
        <div className="mt-4">
          <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
            {resultadosBusqueda.length} resultado
            {resultadosBusqueda.length === 1 ? "" : "s"}
          </p>
          {resultadosBusqueda.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Ningún producto coincide con la búsqueda.
            </p>
          ) : (
            <ProductosList
              productos={resultadosBusqueda}
              sucursales={sucursales}
              precios={precios}
            />
          )}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categoriasOrdenadas.map((categoria) => {
            const items = porCategoria[categoria];
            const Icon = iconoDeCategoria(categoria);
            const gradiente = gradienteDeCategoria(categoria);
            return (
              <button
                key={categoria}
                onClick={() => setCategoriaAbierta(categoria)}
                className={`group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br ${gradiente} p-4 text-center text-white shadow-md transition-transform hover:scale-[1.03] hover:shadow-xl`}
              >
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                <Icon className="h-10 w-10 drop-shadow-sm" />
                <span className="text-sm font-bold">{categoria}</span>
                <span className="text-xs text-white/80">
                  {items.length} producto{items.length === 1 ? "" : "s"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {categoriaAbierta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setCategoriaAbierta(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-zinc-50 p-6 shadow-2xl dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
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

            <ProductosList
              productos={porCategoria[categoriaAbierta]}
              sucursales={sucursales}
              precios={precios}
            />
          </div>
        </div>
      )}
    </div>
  );
}
