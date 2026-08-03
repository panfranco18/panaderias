"use client";

import { useState, useActionState, useRef } from "react";
import {
  actualizarCliente,
  eliminarCliente,
  agregarMovimiento,
  eliminarMovimiento,
  type ActionState,
} from "./actions";
import { IconChevronDown } from "@/components/admin-icons";
import { DeleteButton } from "@/components/delete-button";

type Cliente = {
  id: string;
  nombre: string;
  cuit: string | null;
  domicilio_fiscal: string | null;
  responsable_iva: string | null;
  responsable_contacto: string | null;
  telefono: string | null;
  activo: boolean;
};

type Movimiento = {
  id: string;
  cliente_id: string;
  fecha: string;
  detalle: string | null;
  monto_retiro: number;
  monto_pago: number;
};

const initialState: ActionState = {};

export function ClientesList({
  clientes,
  movimientos,
}: {
  clientes: Cliente[];
  movimientos: Movimiento[];
}) {
  if (clientes.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay clientes con cuenta corriente.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {clientes.map((c) => (
        <ClienteCard
          key={c.id}
          cliente={c}
          movimientos={movimientos.filter((m) => m.cliente_id === c.id)}
        />
      ))}
    </div>
  );
}

function ClienteCard({
  cliente,
  movimientos,
}: {
  cliente: Cliente;
  movimientos: Movimiento[];
}) {
  const [editando, setEditando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const actualizarConId = actualizarCliente.bind(null, cliente.id);
  const [state, formAction, pending] = useActionState(actualizarConId, initialState);

  const agregarMovConId = agregarMovimiento.bind(null, cliente.id);
  const [movState, movAction, movPending] = useActionState(agregarMovConId, initialState);
  const movFormRef = useRef<HTMLFormElement>(null);

  if (state.ok && editando) setEditando(false);

  const saldo = movimientos.reduce(
    (acc, m) => acc + Number(m.monto_retiro) - Number(m.monto_pago),
    0
  );

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            {cliente.nombre}
            {!cliente.activo && (
              <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                inactivo
              </span>
            )}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {[cliente.responsable_iva, cliente.responsable_contacto, cliente.telefono]
              .filter(Boolean)
              .join(" · ") || "Sin datos adicionales"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditando((v) => !v)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
          >
            {editando ? "Cancelar" : "Editar"}
          </button>
          <DeleteButton action={() => eliminarCliente(cliente.id)} label="Eliminar cliente" />
          <button
            onClick={() => setAbierto((v) => !v)}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Saldo: ${saldo.toFixed(2)}
            <IconChevronDown
              className={`h-4 w-4 transition-transform ${abierto ? "rotate-180" : ""}`}
            />
          </button>
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
              defaultValue={cliente.nombre}
              required
              placeholder="Nombre *"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="cuit"
              defaultValue={cliente.cuit ?? ""}
              placeholder="CUIT"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="telefono"
              defaultValue={cliente.telefono ?? ""}
              placeholder="Teléfono"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="domicilio_fiscal"
              defaultValue={cliente.domicilio_fiscal ?? ""}
              placeholder="Domicilio fiscal"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="responsable_iva"
              defaultValue={cliente.responsable_iva ?? ""}
              placeholder="Condición IVA"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="responsable_contacto"
              defaultValue={cliente.responsable_contacto ?? ""}
              placeholder="Responsable / contacto"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input type="checkbox" name="activo" defaultChecked={cliente.activo} className="rounded" />
            Cliente activo
          </label>
          {state.error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
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

      {abierto && (
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          {movimientos.length > 0 && (
            <ul className="mb-3 flex flex-col gap-1.5">
              {movimientos.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span>
                    {new Date(m.fecha + "T00:00:00").toLocaleDateString("es-AR")}
                    {m.detalle ? ` — ${m.detalle}` : ""}
                  </span>
                  <span className="flex items-center gap-2">
                    {Number(m.monto_retiro) > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        +${Number(m.monto_retiro).toFixed(2)}
                      </span>
                    )}
                    {Number(m.monto_pago) > 0 && (
                      <span className="text-green-600 dark:text-green-400">
                        -${Number(m.monto_pago).toFixed(2)}
                      </span>
                    )}
                    <DeleteButton
                      action={() => eliminarMovimiento(m.id)}
                      label="Quitar movimiento"
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}

          <form
            ref={movFormRef}
            action={async (formData) => {
              await movAction(formData);
              movFormRef.current?.reset();
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              type="date"
              name="fecha"
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="detalle"
              placeholder="Detalle"
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              name="monto_retiro"
              placeholder="Retiro $"
              className="w-24 rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              name="monto_pago"
              placeholder="Pago $"
              className="w-24 rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="submit"
              disabled={movPending}
              className="rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {movPending ? "..." : "Agregar movimiento"}
            </button>
          </form>
          {movState.error && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{movState.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
