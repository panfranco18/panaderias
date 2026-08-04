"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearAviso, type ActionState } from "./actions";
import { IconPlus } from "@/components/admin-icons";

const initialState: ActionState = {};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export function NuevoAvisoForm({
  empleados,
}: {
  empleados: { id: string; nombre: string }[];
}) {
  const [state, formAction, pending] = useActionState(crearAviso, initialState);
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
        Nuevo aviso
      </h2>

      <div className="mt-3 flex flex-col gap-3">
        <textarea
          name="mensaje"
          required
          rows={3}
          placeholder="Ej: ¡Buen día equipo! Hoy llega el pedido de harina a la tarde."
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            name="perfil_id"
            defaultValue=""
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">Para todos los empleados</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                Solo para {e.nombre}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="fecha"
            defaultValue={hoyISO()}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      {state.error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        <IconPlus className="h-4 w-4" />
        {pending ? "Guardando..." : "Publicar aviso"}
      </button>
    </form>
  );
}
