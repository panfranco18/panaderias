"use client";

import { useActionState, useRef, useEffect } from "react";
import { registrarMovimiento, type ActionState } from "./actions";

type Producto = { id: string; nombre: string; categoria: string };
type Stock = { producto_id: string; cantidad: number; unidad: string };

const initialState: ActionState = {};

export function StockTabla({
  productos,
  stock,
  sucursalId,
}: {
  productos: Producto[];
  stock: Stock[];
  sucursalId: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {productos.map((p) => {
        const actual = stock.find((s) => s.producto_id === p.id);
        return (
          <StockRow
            key={p.id}
            producto={p}
            sucursalId={sucursalId}
            cantidadActual={actual?.cantidad ?? 0}
            unidad={actual?.unidad ?? "unidad"}
          />
        );
      })}
    </div>
  );
}

function StockRow({
  producto,
  sucursalId,
  cantidadActual,
  unidad,
}: {
  producto: Producto;
  sucursalId: string;
  cantidadActual: number;
  unidad: string;
}) {
  const [state, formAction, pending] = useActionState(
    registrarMovimiento,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {producto.nombre}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {producto.categoria}
          </p>
        </div>
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {cantidadActual}{" "}
          <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
            {unidad}
          </span>
        </p>
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="mt-2 flex flex-wrap items-center gap-2"
      >
        <input type="hidden" name="producto_id" value={producto.id} />
        <input type="hidden" name="sucursal_id" value={sucursalId} />
        <select
          name="tipo"
          defaultValue="ingreso"
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Egreso</option>
          <option value="ajuste">Ajuste (fijar cantidad)</option>
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          name="cantidad"
          required
          placeholder="Cantidad"
          className="w-24 rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          name="motivo"
          placeholder="Motivo (opcional)"
          className="min-w-32 flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {pending ? "..." : "Registrar"}
        </button>
      </form>
      {state.error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </div>
  );
}
