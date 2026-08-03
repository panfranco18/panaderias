"use client";

import { useActionState, useState } from "react";
import {
  actualizarEmpleado,
  eliminarEmpleado,
  darAccesoAEmpleado,
  type ActionState,
} from "./actions";
import { MODULOS_ACCESO } from "./modulos";
import { DeleteButton } from "@/components/delete-button";
import { DarAccesoForm } from "./dar-acceso-form";

type Perfil = {
  id: string;
  nombre: string;
  cargo: string | null;
  rol: string;
  sucursal_id: string | null;
  nivel_acceso: Record<string, boolean> | null;
  activo: boolean;
  empleado_id: string | null;
};

type EmpleadoRoster = {
  id: string;
  nombre: string;
  apellido: string | null;
};

const initialState: ActionState = {};

const ROL_LABEL: Record<string, string> = {
  superadmin: "Superadmin",
  encargado_sucursal: "Encargado de sucursal",
  empleado: "Empleado",
};

export function PersonalList({
  perfiles,
  empleadosRoster,
  sucursales,
}: {
  perfiles: Perfil[];
  empleadosRoster: EmpleadoRoster[];
  sucursales: { id: string; nombre: string }[];
}) {
  const sucursalNombre = (id: string | null) =>
    sucursales.find((s) => s.id === id)?.nombre ?? "Sin asignar";

  const perfilesHuerfanos = perfiles.filter(
    (p) => !p.empleado_id || !empleadosRoster.some((e) => e.id === p.empleado_id)
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Empleados (legajo)
        </h3>
        {empleadosRoster.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Todavía no hay empleados cargados en{" "}
            <span className="font-medium">Empleados</span>.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {empleadosRoster.map((emp) => (
              <RosterCard
                key={emp.id}
                empleado={emp}
                perfil={perfiles.find((p) => p.empleado_id === emp.id) ?? null}
                sucursales={sucursales}
                sucursalNombreFn={sucursalNombre}
              />
            ))}
          </div>
        )}
      </div>

      {perfilesHuerfanos.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Otras cuentas (sin vincular a un empleado del legajo)
          </h3>
          <div className="flex flex-col gap-3">
            {perfilesHuerfanos.map((p) => (
              <EmpleadoCard
                key={p.id}
                empleado={p}
                sucursales={sucursales}
                sucursalNombre={sucursalNombre(p.sucursal_id)}
                deleteLabel="Eliminar cuenta"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RosterCard({
  empleado,
  perfil,
  sucursales,
  sucursalNombreFn,
}: {
  empleado: EmpleadoRoster;
  perfil: Perfil | null;
  sucursales: { id: string; nombre: string }[];
  sucursalNombreFn: (id: string | null) => string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const darAccesoConId = darAccesoAEmpleado.bind(null, empleado.id);
  const [state, formAction, pending] = useActionState(darAccesoConId, initialState);
  const nombreCompleto = [empleado.nombre, empleado.apellido]
    .filter(Boolean)
    .join(" ");

  if (state.ok && state.passwordTemporal && !dismissed) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <p className="font-semibold text-zinc-900 dark:text-zinc-50">
          {nombreCompleto}
        </p>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
          Acceso creado. Contraseña temporal:{" "}
          <code className="font-mono font-bold">{state.passwordTemporal}</code> —
          copiala y compartila ahora, no se vuelve a mostrar.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="mt-3 rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
        >
          Ya la copié
        </button>
      </div>
    );
  }

  if (perfil) {
    return (
      <EmpleadoCard
        empleado={perfil}
        sucursales={sucursales}
        sucursalNombre={sucursalNombreFn(perfil.sucursal_id)}
        nombreOverride={nombreCompleto}
        deleteLabel="Quitar acceso"
      />
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            {nombreCompleto}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sin acceso al panel
          </p>
        </div>
        <button
          onClick={() => setAbierto((v) => !v)}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
        >
          {abierto ? "Cancelar" : "Dar acceso"}
        </button>
      </div>
      {abierto && (
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <DarAccesoForm
            sucursales={sucursales}
            formAction={formAction}
            pending={pending}
            error={state.error}
          />
        </div>
      )}
    </div>
  );
}

function EmpleadoCard({
  empleado,
  sucursales,
  sucursalNombre,
  nombreOverride,
  deleteLabel = "Eliminar empleado",
}: {
  empleado: Perfil;
  sucursales: { id: string; nombre: string }[];
  sucursalNombre: string;
  nombreOverride?: string;
  deleteLabel?: string;
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
            {nombreOverride ?? empleado.nombre}
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
            label={deleteLabel}
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
              defaultValue={nombreOverride ?? empleado.nombre}
              required
              readOnly={!!nombreOverride}
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
