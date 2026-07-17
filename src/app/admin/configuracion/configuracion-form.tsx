"use client";

import { useActionState } from "react";
import { guardarConfiguracion, type ActionState } from "./actions";

const initialState: ActionState = {};

type Config = {
  mercadopago_alias: string | null;
  mercadopago_titular: string | null;
  mercadopago_cbu: string | null;
} | null;

export function ConfiguracionForm({ config }: { config: Config }) {
  const [state, formAction, pending] = useActionState(
    guardarConfiguracion,
    initialState
  );

  return (
    <form
      action={formAction}
      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Cuenta de MercadoPago
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Se muestra al cliente cuando elige pagar por MercadoPago. El pago se
        confirma manualmente, no hay integración automática con la API de
        MercadoPago.
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Alias
          </label>
          <input
            name="mercadopago_alias"
            defaultValue={config?.mercadopago_alias ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="panaderia.pagos"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Titular de la cuenta
          </label>
          <input
            name="mercadopago_titular"
            defaultValue={config?.mercadopago_titular ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Nombre y apellido"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            CBU / CVU (opcional)
          </label>
          <input
            name="mercadopago_cbu"
            defaultValue={config?.mercadopago_cbu ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="0000003100000000000000"
          />
        </div>
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
        disabled={pending}
        className="mt-4 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
