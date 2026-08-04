"use client";

import { useActionState } from "react";
import { declararStockDiario, type ActionState } from "./actions";

const initialState: ActionState = {};

export function DeclararStockForm({
  sucursalId,
  categorias,
}: {
  sucursalId: string;
  categorias: { categoria: string; cantidadInicial: number | null }[];
}) {
  const accion = declararStockDiario.bind(null, sucursalId);
  const [state, formAction, pending] = useActionState(accion, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      {categorias.map((c) => (
        <label key={c.categoria} className="flex items-center justify-between gap-2 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">{c.categoria}</span>
          <input
            type="number"
            step="1"
            min="0"
            name={`cantidad_${c.categoria}`}
            defaultValue={c.cantidadInicial ?? ""}
            placeholder="Sin declarar"
            className="w-24 rounded-md border border-zinc-300 px-2 py-1 text-right text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
      ))}
      {state.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar stock de hoy"}
      </button>
    </form>
  );
}
