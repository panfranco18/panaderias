"use client";

import { useActionState, useState } from "react";
import { actualizarVisibilidadCategorias, type ActionState } from "./actions";
import { CATEGORIAS } from "./categorias";
import { IconChevronDown } from "@/components/admin-icons";

const initialState: ActionState = {};

export function CategoriasVisibilidadForm({
  visibilidad,
}: {
  visibilidad: Record<string, boolean>;
}) {
  const [abierto, setAbierto] = useState(false);
  const [state, formAction, pending] = useActionState(
    actualizarVisibilidadCategorias,
    initialState
  );

  const ocultas = CATEGORIAS.filter((c) => visibilidad[c] === false).length;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Categorías visibles en la página de inicio
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {ocultas === 0
              ? "Se muestran todas"
              : `${ocultas} categoría${ocultas === 1 ? "" : "s"} oculta${ocultas === 1 ? "" : "s"} del sitio público`}
          </p>
        </div>
        <IconChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && (
        <form action={formAction} className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            Desmarcá las categorías que no querés que aparezcan en la home
            (siguen disponibles en el panel — Productos, Stock, Caja).
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIAS.map((categoria) => (
              <label
                key={categoria}
                className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300"
              >
                <input
                  type="checkbox"
                  name={`visible_${categoria}`}
                  defaultChecked={visibilidad[categoria] !== false}
                  className="rounded"
                />
                {categoria}
              </label>
            ))}
          </div>

          {state.error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-4 rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}
    </div>
  );
}
