"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearPedido, type ActionState } from "./actions";
import { IconPlus } from "@/components/admin-icons";

const initialState: ActionState = {};

export function NuevoPedidoForm({
  sucursales,
}: {
  sucursales: { id: string; nombre: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    crearPedido,
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
        Nuevo pedido
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="cliente_nombre"
          required
          placeholder="Nombre del cliente *"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          name="cliente_telefono"
          placeholder="Teléfono"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          type="email"
          name="cliente_email"
          placeholder="Email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <select
          name="tipo"
          defaultValue="online"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="online">Pedido online</option>
          <option value="evento">Consulta de fiesta/evento</option>
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
          type="date"
          name="fecha_evento"
          title="Fecha del evento (si aplica)"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <textarea
          name="notas"
          rows={2}
          placeholder="Notas (ej: torta de cumpleaños para 20 personas)"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2 dark:border-zinc-700 dark:bg-zinc-950"
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
        {pending ? "Guardando..." : "Agregar pedido"}
      </button>
    </form>
  );
}
