"use client";

import { useActionState, useRef, useEffect } from "react";
import { registrarMovimientoCaja, type ActionState } from "./actions";
import { IconPlus } from "@/components/admin-icons";

const initialState: ActionState = {};

export function NuevoMovimientoForm({ sucursalId }: { sucursalId: string }) {
  const [state, formAction, pending] = useActionState(
    registrarMovimientoCaja,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Nuevo movimiento
      </h2>
      <input type="hidden" name="sucursal_id" value={sucursalId} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          name="tipo"
          defaultValue="ingreso"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="apertura">Apertura</option>
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Egreso</option>
          <option value="cierre">Cierre</option>
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          name="monto"
          required
          placeholder="Monto *"
          className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          name="descripcion"
          placeholder="Descripción (opcional)"
          className="min-w-40 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          <IconPlus className="h-4 w-4" />
          {pending ? "Guardando..." : "Registrar"}
        </button>
      </div>
      {state.error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
