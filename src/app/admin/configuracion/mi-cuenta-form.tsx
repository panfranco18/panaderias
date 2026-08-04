"use client";

import { useActionState, useRef, useState } from "react";
import { actualizarMiCuenta, type ActionState } from "./actions";

const initialState: ActionState = {};

export function MiCuentaForm({ nombre }: { nombre: string }) {
  const [state, formAction, pending] = useActionState(actualizarMiCuenta, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const noCoinciden = password.length > 0 && password !== confirmar;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Mi cuenta
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Cambiá tu nombre visible o tu contraseña de acceso al panel.
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Nombre
          </label>
          <input
            name="nombre"
            defaultValue={nombre}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Contraseña nueva (opcional)
          </label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Dejar en blanco para no cambiarla"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        {password && (
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmar_password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            {noCoinciden && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Las contraseñas no coinciden.
              </p>
            )}
          </div>
        )}
      </div>

      {state.error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="mt-3 text-sm text-green-600 dark:text-green-400">
          Guardado.
        </p>
      )}

      <button
        type="submit"
        disabled={pending || noCoinciden}
        className="mt-4 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
