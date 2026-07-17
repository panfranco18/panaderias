"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearProveedor, type ActionState } from "./actions";
import { IconPlus } from "@/components/admin-icons";

const initialState: ActionState = {};

export function NuevoProveedorForm() {
  const [state, formAction, pending] = useActionState(
    crearProveedor,
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
        Nuevo proveedor
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        <input
          name="nombre"
          required
          placeholder="Nombre *"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          name="telefono"
          placeholder="Teléfono"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          name="contacto"
          placeholder="Persona de contacto"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <textarea
          name="notas"
          rows={2}
          placeholder="Notas"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      {state.error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        <IconPlus className="h-4 w-4" />
        {pending ? "Guardando..." : "Agregar proveedor"}
      </button>
    </form>
  );
}
