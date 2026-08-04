"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  actualizarProducto,
  actualizarPrecioGlobal,
  eliminarProducto,
  guardarPreciosSucursal,
  type ActionState,
} from "./actions";
import { IconChevronDown, IconPackage } from "@/components/admin-icons";
import { DeleteButton } from "@/components/delete-button";

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

const UNIDAD_LABEL: Record<string, string> = {
  unidad: "unidad",
  kg: "kg",
  gramo: "gramo",
  docena: "docena",
};

type PrecioSucursal = {
  producto_id: string;
  sucursal_id: string;
  precio: number;
};

const initialState: ActionState = {};

export function ProductosList({
  productos,
  sucursales,
  precios,
  categorias,
}: {
  productos: Producto[];
  sucursales: { id: string; nombre: string }[];
  precios: PrecioSucursal[];
  categorias: string[];
}) {
  if (productos.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay productos cargados.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {productos.map((p) => (
        <ProductoCard
          key={p.id}
          producto={p}
          sucursales={sucursales}
          precios={precios.filter((pr) => pr.producto_id === p.id)}
          categorias={categorias}
        />
      ))}
    </div>
  );
}

function ProductoCard({
  producto,
  sucursales,
  precios,
  categorias,
}: {
  producto: Producto;
  sucursales: { id: string; nombre: string }[];
  precios: PrecioSucursal[];
  categorias: string[];
}) {
  const [editando, setEditando] = useState(false);
  const [preciosAbierto, setPreciosAbierto] = useState(false);

  const actualizarConId = actualizarProducto.bind(null, producto.id);
  const [state, formAction, pending] = useActionState(
    actualizarConId,
    initialState
  );

  const guardarPreciosConId = guardarPreciosSucursal.bind(null, producto.id);
  const [precioState, precioAction, precioPending] = useActionState(
    guardarPreciosConId,
    initialState
  );

  const precioGlobalConId = actualizarPrecioGlobal.bind(null, producto.id);
  const [precioGlobalState, precioGlobalAction, precioGlobalPending] =
    useActionState(precioGlobalConId, initialState);

  if (state.ok && editando) setEditando(false);

  return (
    <div className="flex flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative h-36 w-full overflow-hidden rounded-t-lg bg-amber-50 dark:bg-zinc-800">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-amber-300 dark:text-zinc-600">
            <IconPackage className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {producto.nombre}
              {!producto.activo && (
                <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  inactivo
                </span>
              )}
            </p>
            <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">
              {producto.categoria}
            </p>
          </div>
          <p className="whitespace-nowrap font-semibold text-zinc-900 dark:text-zinc-50">
            ${producto.precio_base.toFixed(2)}
            {producto.unidad_medida && producto.unidad_medida !== "unidad" && (
              <span className="ml-0.5 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                /{UNIDAD_LABEL[producto.unidad_medida]}
              </span>
            )}
          </p>
        </div>

        {producto.descripcion && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {producto.descripcion}
          </p>
        )}

        <form
          action={precioGlobalAction}
          className="mt-2 flex items-center gap-1.5"
        >
          <span className="text-xs text-zinc-500 dark:text-zinc-400">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            name="precio"
            defaultValue={producto.precio_base}
            className="w-24 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="submit"
            disabled={precioGlobalPending}
            title="Actualiza el precio en todas las sucursales (borra los precios distintos por sucursal)"
            className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {precioGlobalPending ? "..." : "Aplicar a todas"}
          </button>
        </form>
        {precioGlobalState.error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {precioGlobalState.error}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setEditando((v) => !v)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
          >
            {editando ? "Cancelar" : "Editar"}
          </button>
          <DeleteButton
            action={() => eliminarProducto(producto.id)}
            label="Eliminar producto"
          />
          <button
            onClick={() => setPreciosAbierto((v) => !v)}
            className="ml-auto flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Precios por sucursal
            <IconChevronDown
              className={`h-4 w-4 transition-transform ${preciosAbierto ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {editando && (
          <form action={formAction} className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="grid grid-cols-1 gap-3">
              <input
                name="nombre"
                defaultValue={producto.nombre}
                required
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                placeholder="Nombre"
              />
              <select
                name="categoria"
                defaultValue={producto.categoria}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                name="precio_base"
                defaultValue={producto.precio_base}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <select
                name="unidad_medida"
                defaultValue={producto.unidad_medida ?? "unidad"}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="unidad">Se vende por unidad</option>
                <option value="kg">Se vende por kilo</option>
                <option value="gramo">Se vende por gramo</option>
                <option value="docena">Se vende por docena</option>
              </select>
              <textarea
                name="descripcion"
                defaultValue={producto.descripcion ?? ""}
                rows={2}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                name="codigo_barras"
                defaultValue={producto.codigo_barras ?? ""}
                placeholder="Código de barras"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Stock mínimo (avisa si baja de esto)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="stock_minimo"
                  defaultValue={producto.stock_minimo ?? 0}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
              <input
                type="file"
                name="imagen"
                accept="image/*"
                className="text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-amber-800 dark:text-zinc-400 dark:file:bg-amber-900/40 dark:file:text-amber-200"
              />
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <input type="checkbox" name="activo" defaultChecked={producto.activo} className="rounded" />
                Producto activo
              </label>
            </div>
            {state.error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="mt-3 rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {pending ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        )}

        {preciosAbierto && (
          <form
            action={precioAction}
            className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800"
          >
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Dejar vacío usa el precio base (${producto.precio_base.toFixed(2)}).
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {sucursales.length === 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No hay sucursales cargadas todavía.
                </p>
              )}
              {sucursales.map((s) => {
                const existente = precios.find((pr) => pr.sucursal_id === s.id);
                return (
                  <label key={s.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-zinc-700 dark:text-zinc-300">{s.nombre}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name={`precio_${s.id}`}
                      defaultValue={existente?.precio ?? ""}
                      placeholder={producto.precio_base.toFixed(2)}
                      className="w-28 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </label>
                );
              })}
            </div>
            {precioState.error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{precioState.error}</p>
            )}
            <button
              type="submit"
              disabled={precioPending}
              className="mt-3 rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {precioPending ? "Guardando..." : "Guardar precios"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
