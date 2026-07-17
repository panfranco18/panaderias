"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearFacturaVenta, type ActionState } from "./actions";
import { IconPlus } from "@/components/admin-icons";

const initialState: ActionState = {};

export function NuevaFacturaVentaForm({
  sucursalId,
  fecha,
}: {
  sucursalId: string;
  fecha: string;
}) {
  const [state, formAction, pending] = useActionState(
    crearFacturaVenta,
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
        Nueva factura
      </h2>
      <input type="hidden" name="sucursal_id" value={sucursalId} />
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="numero"
          placeholder="N° de factura"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          name="cuit_cliente"
          placeholder="CUIT del cliente"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <select
          name="metodo_pago"
          defaultValue=""
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">Método de pago...</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
          <option value="mercadopago">MercadoPago</option>
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          name="monto"
          required
          placeholder="Monto *"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input type="hidden" name="fecha" value={fecha} />
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
