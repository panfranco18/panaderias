"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearContrato, type ActionState } from "./actions";
import { IconPlus } from "@/components/admin-icons";

const initialState: ActionState = {};

export function NuevoContratoForm({
  sucursales,
}: {
  sucursales: { id: string; nombre: string }[];
}) {
  const [state, formAction, pending] = useActionState(crearContrato, initialState);
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
        Nuevo contrato de alquiler
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="local"
          required
          placeholder="Local *"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <select
          name="sucursal_id"
          defaultValue=""
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">Vincular a sucursal...</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
        <input
          name="titular"
          placeholder="Titular"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          name="inmobiliaria"
          placeholder="Inmobiliaria"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Inicio del contrato
          </label>
          <input
            type="date"
            name="fecha_inicio"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Fin del contrato
          </label>
          <input
            type="date"
            name="fecha_fin"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <textarea
          name="aumentos"
          rows={2}
          placeholder="Aumentos previstos"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <textarea
          name="arreglos"
          rows={2}
          placeholder="Arreglos a cargo del inquilino/dueño"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <textarea
          name="observaciones"
          rows={2}
          placeholder="Observaciones"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
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
        {pending ? "Guardando..." : "Agregar contrato"}
      </button>
    </form>
  );
}
