"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearFacturaProveedor, type ActionState } from "./actions";
import { IconPlus, IconUpload } from "@/components/admin-icons";

const initialState: ActionState = {};

export function NuevaFacturaForm({
  proveedores,
  sucursales,
}: {
  proveedores: { id: string; nombre: string }[];
  sucursales: { id: string; nombre: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    crearFacturaProveedor,
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
        Nueva factura de proveedor
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          name="proveedor_id"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">Proveedor...</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
        <select
          name="sucursal_id"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">Sucursal...</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
        <input
          name="numero_factura"
          placeholder="N° de factura"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          type="date"
          name="fecha"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          type="number"
          step="0.01"
          min="0"
          name="monto"
          required
          placeholder="Monto *"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <IconUpload className="h-3.5 w-3.5" />
            Foto del comprobante
          </label>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            className="mt-1 w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-amber-800 dark:text-zinc-400 dark:file:bg-amber-900/40 dark:file:text-amber-200"
          />
        </div>
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
        {pending ? "Guardando..." : "Agregar factura"}
      </button>
    </form>
  );
}
