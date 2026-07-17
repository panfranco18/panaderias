"use client";

import { useActionState, useState } from "react";
import {
  actualizarEmpleado,
  eliminarEmpleado,
  type ActionState,
} from "./actions";
import { MODULOS_ACCESO } from "./modulos";
import { DeleteButton } from "@/components/delete-button";

type Empleado = {
  id: string;
  nombre: string;
  cargo: string | null;
  rol: string;
  sucursal_id: string | null;
  nivel_acceso: Record<string, boolean> | null;
  activo: boolean;
};

const initialState: ActionState = {};

const ROL_LABEL: Record<string, string> = {
  superadmin: "Superadmin",
  encargado_sucursal: "Encargado de sucursal",
  empleado: "Empleado",
};

export function PersonalList({
  empleados,
  sucursales,
}: {
  empleados: Empleado[];
  sucursales: { id: string; nombre: string }[];
}) {
  if (empleados.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay empleados cargados.
      </p>
    );
  }

  const sucursalNombre = (id: string | null) =>
    sucursales.find((s) => s.id === id)?.nombre ?? "Sin asignar";

  return (
    <div className="flex flex-col gap-3">
      {empleados.map((e) => (
        <EmpleadoCard
          key={e.id}
          empleado={e}
          sucursales={sucursales}
          sucursalNombre={sucursalNombre(e.sucursal_id)}
        />
      ))}
    </div>
  );
}

function EmpleadoCard({
  empleado,
  sucursales,
  sucursalNombre,
}: {
  empleado: Empleado;
  sucursales: { id: string; nombre: string }[];
  sucursalNombre: string;
}) {
  const [editando, setEditando] = useState(false);
  const actualizarConId = actualizarEmpleado.bind(null, empleado.id);
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
            {empleado.nombre}
            {!empleado.activo && (
              <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                inactivo
              </span>
            )}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {empleado.cargo || ROL_LABEL[empleado.rol]} · {sucursalNombre} ·{" "}
            {ROL_LABEL[empleado.rol]}
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
            action={() => eliminarEmpleado(empleado.id)}
            label="Eliminar empleado"
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
              defaultValue={empleado.nombre}
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Nombre"
            />
            <input
              name="cargo"
              defaultValue={empleado.cargo ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Cargo"
            />
            <select
              name="sucursal_id"
              defaultValue={empleado.sucursal_id ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">Sin asignar</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            <select
              name="rol"
              defaultValue={empleado.rol}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="empleado">Empleado</option>
              <option value="encargado_sucursal">Encargado de sucursal</option>
              <option value="superadmin">Superadmin (dueño)</option>
            </select>
          </div>

          <fieldset className="mt-3">
            <legend className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Nivel de acceso al panel
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MODULOS_ACCESO.map((m) => (
                <label
                  key={m.key}
                  className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <input
                    type="checkbox"
                    name={`acceso_${m.key}`}
                    defaultChecked={!!empleado.nivel_acceso?.[m.key]}
                    className="rounded"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              name="activo"
              defaultChecked={empleado.activo}
              className="rounded"
            />
            Empleado activo
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
    </div>
  );
}
