"use client";

import { useActionState, useRef, useEffect } from "react";
import { reportarFaltanteStock, type ActionState } from "./actions";
import { IconAlertTriangle } from "@/components/admin-icons";

const initialState: ActionState = {};

export function ReportarFaltanteForm({
  sucursalId,
  categorias,
}: {
  sucursalId: string;
  categorias: string[];
}) {
  const [state, formAction, pending] = useActionState(
    reportarFaltanteStock,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  if (categorias.length === 0) return null;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        <IconAlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        Reportar faltante de stock
      </h2>
      <input type="hidden" name="sucursal_id" value={sucursalId} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          name="categoria"
          required
          defaultValue=""
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="" disabled>
            Categoría...
          </option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          name="descripcion"
          required
          placeholder="Qué falta *"
          className="min-w-40 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "Enviando..." : "Reportar"}
        </button>
      </div>
      {state.error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          Reportado. El superadmin fue notificado.
        </p>
      )}
    </form>
  );
}
