"use client";

import { useActionState, useState } from "react";
import {
  actualizarProveedor,
  eliminarProveedor,
  type ActionState,
} from "./actions";
import { DeleteButton } from "@/components/delete-button";

type Proveedor = {
  id: string;
  nombre: string;
  telefono: string | null;
  contacto: string | null;
  notas: string | null;
};

const initialState: ActionState = {};

export function ProveedoresList({ proveedores }: { proveedores: Proveedor[] }) {
  if (proveedores.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay proveedores cargados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {proveedores.map((p) => (
        <ProveedorCard key={p.id} proveedor={p} />
      ))}
    </div>
  );
}

function ProveedorCard({ proveedor }: { proveedor: Proveedor }) {
  const [editando, setEditando] = useState(false);
  const actualizarConId = actualizarProveedor.bind(null, proveedor.id);
  const [state, formAction, pending] = useActionState(
    actualizarConId,
    initialState
  );

  if (state.ok && editando) setEditando(false);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            {proveedor.nombre}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {[proveedor.telefono, proveedor.contacto].filter(Boolean).join(" · ") ||
              "Sin datos de contacto"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditando((v) => !v)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
          >
            {editando ? "Cancelar" : "Editar"}
          </button>
          <DeleteButton
            action={() => eliminarProveedor(proveedor.id)}
            label="Eliminar proveedor"
          />
        </div>
      </div>

      {editando && (
        <form
          action={formAction}
          className="border-t border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="nombre"
              defaultValue={proveedor.nombre}
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Nombre"
            />
            <input
              name="telefono"
              defaultValue={proveedor.telefono ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Teléfono"
            />
            <input
              name="contacto"
              defaultValue={proveedor.contacto ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Contacto"
            />
            <textarea
              name="notas"
              defaultValue={proveedor.notas ?? ""}
              rows={2}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2 dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Notas"
            />
          </div>
          {state.error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-3 rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      )}
    </div>
  );
}
