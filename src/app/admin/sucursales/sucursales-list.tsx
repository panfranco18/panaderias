"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  actualizarSucursal,
  eliminarSucursal,
  type ActionState,
} from "./actions";
import { IconChevronDown, IconUsers } from "@/components/admin-icons";
import { DeleteButton } from "@/components/delete-button";

type Sucursal = {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  activa: boolean;
};

type Empleado = {
  id: string;
  nombre: string;
  cargo: string | null;
  rol: string;
  sucursal_id: string | null;
};

const initialState: ActionState = {};

export function SucursalesList({
  sucursales,
  empleados,
}: {
  sucursales: Sucursal[];
  empleados: Empleado[];
}) {
  if (sucursales.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay sucursales cargadas.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sucursales.map((s) => (
        <SucursalCard
          key={s.id}
          sucursal={s}
          empleados={empleados.filter((e) => e.sucursal_id === s.id)}
        />
      ))}
    </div>
  );
}

function SucursalCard({
  sucursal,
  empleados,
}: {
  sucursal: Sucursal;
  empleados: Empleado[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(false);

  const actualizarConId = actualizarSucursal.bind(null, sucursal.id);
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
            {sucursal.nombre}
            {!sucursal.activa && (
              <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                inactiva
              </span>
            )}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {[sucursal.telefono, sucursal.direccion].filter(Boolean).join(" · ") ||
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
            action={() => eliminarSucursal(sucursal.id)}
            label="Eliminar sucursal"
          />
          <button
            onClick={() => setAbierto((v) => !v)}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-expanded={abierto}
          >
            <IconUsers className="h-4 w-4" />
            {empleados.length}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              name="nombre"
              defaultValue={sucursal.nombre}
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Nombre"
            />
            <input
              name="telefono"
              defaultValue={sucursal.telefono ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Teléfono"
            />
            <input
              name="direccion"
              defaultValue={sucursal.direccion ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Dirección"
            />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              name="activa"
              defaultChecked={sucursal.activa}
              className="rounded"
            />
            Sucursal activa
          </label>
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

      {abierto && (
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Empleados asignados
          </p>
          {empleados.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Sin empleados asignados todavía. Se cargan desde{" "}
              <span className="font-medium">Personal</span>.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {empleados.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span>{e.nombre}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {e.cargo || e.rol}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
