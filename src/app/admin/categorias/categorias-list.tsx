"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { actualizarCategoria, eliminarCategoria, type ActionState } from "./actions";
import { iconoDeCategoria } from "@/lib/categoria-visual";
import { IconUpload } from "@/components/admin-icons";
import { DeleteButton } from "@/components/delete-button";

type Categoria = {
  categoria: string;
  visible_web: boolean;
  imagen_url: string | null;
  permite_reportar_faltante: boolean;
};

const initialState: ActionState = {};

export function CategoriasList({
  categorias,
  conteos,
}: {
  categorias: Categoria[];
  conteos: Record<string, number>;
}) {
  if (categorias.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay categorías configuradas.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {categorias.map((c) => (
        <CategoriaCard
          key={c.categoria}
          categoria={c}
          cantidad={conteos[c.categoria] ?? 0}
        />
      ))}
    </div>
  );
}

function CategoriaCard({
  categoria,
  cantidad,
}: {
  categoria: Categoria;
  cantidad: number;
}) {
  const [editando, setEditando] = useState(false);
  const actualizarConNombre = actualizarCategoria.bind(null, categoria.categoria);
  const [state, formAction, pending] = useActionState(actualizarConNombre, initialState);
  const Icon = iconoDeCategoria(categoria.categoria);

  if (state.ok && editando) setEditando(false);

  return (
    <div className="flex flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3 p-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-amber-100 dark:bg-zinc-800">
          {categoria.imagen_url ? (
            <Image
              src={categoria.imagen_url}
              alt={categoria.categoria}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-amber-400 dark:text-zinc-500">
              <Icon className="h-7 w-7" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
            {categoria.categoria}
            {!categoria.visible_web && (
              <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                oculta
              </span>
            )}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {cantidad} producto{cantidad === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setEditando((v) => !v)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
          >
            {editando ? "Cancelar" : "Editar"}
          </button>
          <DeleteButton
            action={() => eliminarCategoria(categoria.categoria)}
            label="Eliminar categoría"
          />
        </div>
      </div>

      {editando && (
        <form
          action={formAction}
          className="border-t border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <IconUpload className="h-3.5 w-3.5" />
              Cambiar imagen
            </label>
            <input
              type="file"
              name="imagen"
              accept="image/*"
              className="mt-1 w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-amber-800 dark:text-zinc-400 dark:file:bg-amber-900/40 dark:file:text-amber-200"
            />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              name="visible_web"
              defaultChecked={categoria.visible_web}
              className="rounded"
            />
            Visible en la página de inicio
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              name="permite_reportar_faltante"
              defaultChecked={categoria.permite_reportar_faltante}
              className="rounded"
            />
            Los empleados pueden reportar faltantes en esta categoría
          </label>
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
    </div>
  );
}
