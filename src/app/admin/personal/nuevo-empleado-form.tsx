"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearEmpleado, type ActionState } from "./actions";
import { MODULOS_ACCESO } from "./modulos";
import { IconPlus } from "@/components/admin-icons";

const initialState: ActionState = {};

export function NuevoEmpleadoForm({
  sucursales,
}: {
  sucursales: { id: string; nombre: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    crearEmpleado,
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
        Nuevo empleado
      </h2>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Nombre *
          </label>
          <input
            name="nombre"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Email (login) *
          </label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Cargo
          </label>
          <input
            name="cargo"
            placeholder="Ej: Vendedora, Panadero..."
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Sucursal
          </label>
          <select
            name="sucursal_id"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">Sin asignar</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Rol
          </label>
          <select
            name="rol"
            defaultValue="empleado"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="empleado">Empleado</option>
            <option value="encargado_sucursal">Encargado de sucursal</option>
            <option value="superadmin">Superadmin (dueño)</option>
          </select>
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Nivel de acceso al panel
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MODULOS_ACCESO.map((m) => (
            <label
              key={m.key}
              className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300"
            >
              <input type="checkbox" name={`acceso_${m.key}`} className="rounded" />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      {state.passwordTemporal && (
        <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Empleado creado. Contraseña temporal:{" "}
          <code className="font-mono font-bold">
            {state.passwordTemporal}
          </code>{" "}
          — copiala y compartila ahora, no se vuelve a mostrar.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        <IconPlus className="h-4 w-4" />
        {pending ? "Creando..." : "Agregar empleado"}
      </button>
    </form>
  );
}
