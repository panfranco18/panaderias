"use client";

import { useActionState } from "react";
import { guardarConfigTurnoCaja, type ActionState } from "./actions";

const initialState: ActionState = {};

type Config = {
  sucursal_id: string;
  turno_manana_inicio: string;
  turno_manana_fin: string;
  turno_tarde_inicio: string;
  turno_tarde_fin: string;
  habilita_cierre_x: boolean;
};

export function ConfigTurnosCajaList({
  sucursales,
  configs,
}: {
  sucursales: { id: string; nombre: string }[];
  configs: Config[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sucursales.map((s) => (
        <ConfigTurnoCard
          key={s.id}
          sucursal={s}
          config={configs.find((c) => c.sucursal_id === s.id) ?? null}
        />
      ))}
    </div>
  );
}

function ConfigTurnoCard({
  sucursal,
  config,
}: {
  sucursal: { id: string; nombre: string };
  config: Config | null;
}) {
  const guardarConId = guardarConfigTurnoCaja.bind(null, sucursal.id);
  const [state, formAction, pending] = useActionState(guardarConId, initialState);

  return (
    <form
      action={formAction}
      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {sucursal.nombre}
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Turno mañana
          </label>
          <div className="mt-1 flex items-center gap-1.5">
            <input
              type="time"
              name="turno_manana_inicio"
              defaultValue={config?.turno_manana_inicio?.slice(0, 5) ?? "06:00"}
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">a</span>
            <input
              type="time"
              name="turno_manana_fin"
              defaultValue={config?.turno_manana_fin?.slice(0, 5) ?? "14:00"}
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Turno tarde
          </label>
          <div className="mt-1 flex items-center gap-1.5">
            <input
              type="time"
              name="turno_tarde_inicio"
              defaultValue={config?.turno_tarde_inicio?.slice(0, 5) ?? "14:00"}
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">a</span>
            <input
              type="time"
              name="turno_tarde_fin"
              defaultValue={config?.turno_tarde_fin?.slice(0, 5) ?? "22:00"}
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          name="habilita_cierre_x"
          defaultChecked={config?.habilita_cierre_x ?? false}
          className="rounded"
        />
        Habilitar botón &quot;Cierre X&quot; en el turno mañana
      </label>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Si no lo tildás, el personal de esta sucursal solo ve el botón &quot;Cierre Z&quot;, a cualquier hora.
      </p>

      {state.error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.ok && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">Guardado.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
