"use client";

import { useActionState } from "react";
import { darAccesoAEmpleado, type ActionState } from "./actions";
import { MODULOS_ACCESO } from "./modulos";

const initialState: ActionState = {};

export function DarAccesoForm({
  empleadoId,
  sucursales,
}: {
  empleadoId: string;
  sucursales: { id: string; nombre: string }[];
}) {
  const darAccesoConId = darAccesoAEmpleado.bind(null, empleadoId);
  const [state, formAction, pending] = useActionState(darAccesoConId, initialState);

  return (
    <form
      action={formAction}
      className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="email"
          name="email"
          required
          placeholder="Email (login) *"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          name="cargo"
          placeholder="Cargo (ej: Vendedora, Panadero...)"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <select
          name="sucursal_id"
          defaultValue=""
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">Sin asignar</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
        <select
          name="rol"
          defaultValue="empleado"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="empleado">Empleado</option>
          <option value="encargado_sucursal">Encargado de sucursal</option>
          <option value="superadmin">Superadmin (dueño)</option>
        </select>
      </div>

      <fieldset className="mt-3">
        <legend className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Nivel de acceso al panel
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MODULOS_ACCESO.map((m) => (
            <label
              key={m.key}
              className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300"
            >
              <input type="checkbox" name={`acceso_${m.key}`} className="rounded" />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      {state.passwordTemporal && (
        <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Acceso creado. Contraseña temporal:{" "}
          <code className="font-mono font-bold">{state.passwordTemporal}</code> —
          copiala y compartila ahora, no se vuelve a mostrar.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "Creando..." : "Dar acceso al panel"}
      </button>
    </form>
  );
}
