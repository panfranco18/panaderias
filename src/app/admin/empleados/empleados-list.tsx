"use client";

import { useState, useActionState } from "react";
import { actualizarEmpleado, eliminarEmpleado, type ActionState } from "./actions";
import { DeleteButton } from "@/components/delete-button";

type Empleado = {
  id: string;
  apellido: string | null;
  nombre: string;
  dni: string | null;
  domicilio: string | null;
  fecha_nacimiento: string | null;
  fecha_alta: string | null;
  mes_vacaciones: string | null;
  obra_social: string | null;
  responsable: string | null;
  activo: boolean;
};

const initialState: ActionState = {};

export function EmpleadosList({ empleados }: { empleados: Empleado[] }) {
  if (empleados.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay empleados cargados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {empleados.map((e) => (
        <EmpleadoCard key={e.id} empleado={e} />
      ))}
    </div>
  );
}

function EmpleadoCard({ empleado }: { empleado: Empleado }) {
  const [editando, setEditando] = useState(false);
  const actualizarConId = actualizarEmpleado.bind(null, empleado.id);
  const [state, formAction, pending] = useActionState(actualizarConId, initialState);

  if (state.ok && editando) setEditando(false);

  const nombreCompleto = [empleado.apellido, empleado.nombre].filter(Boolean).join(", ");

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            {nombreCompleto}
            {!empleado.activo && (
              <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                inactivo
              </span>
            )}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {[empleado.dni, empleado.domicilio, empleado.obra_social]
              .filter(Boolean)
              .join(" · ") || "Sin datos adicionales"}
          </p>
          {empleado.responsable && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Responsable: {empleado.responsable}
            </p>
          )}
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
              name="apellido"
              defaultValue={empleado.apellido ?? ""}
              placeholder="Apellido"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="nombre"
              defaultValue={empleado.nombre}
              required
              placeholder="Nombre *"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="dni"
              defaultValue={empleado.dni ?? ""}
              placeholder="DNI"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="domicilio"
              defaultValue={empleado.domicilio ?? ""}
              placeholder="Domicilio"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                defaultValue={empleado.fecha_nacimiento ?? ""}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Fecha de alta
              </label>
              <input
                type="date"
                name="fecha_alta"
                defaultValue={empleado.fecha_alta ?? ""}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <input
              name="mes_vacaciones"
              defaultValue={empleado.mes_vacaciones ?? ""}
              placeholder="Mes de vacaciones"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="obra_social"
              defaultValue={empleado.obra_social ?? ""}
              placeholder="Obra social"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="responsable"
              defaultValue={empleado.responsable ?? ""}
              placeholder="Responsable a cargo"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
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
    </div>
  );
}
