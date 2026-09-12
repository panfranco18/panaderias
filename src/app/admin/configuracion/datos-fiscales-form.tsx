"use client";

import { useActionState } from "react";
import { guardarDatosFiscales, type ActionState } from "./actions";

const initialState: ActionState = {};

type Config = {
  razon_social: string | null;
  cuit: string | null;
  condicion_iva: string | null;
  ingresos_brutos: string | null;
  inicio_actividades: string | null;
} | null;

export function DatosFiscalesForm({ config }: { config: Config }) {
  const [state, formAction, pending] = useActionState(
    guardarDatosFiscales,
    initialState
  );

  return (
    <form
      action={formAction}
      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Datos fiscales del negocio
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Aparecen en el encabezado de las facturas, remitos y presupuestos que
        se generan en Facturación. El punto de venta se configura por
        sucursal, en el módulo <b>Sucursales</b>.
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Razón social
          </label>
          <input
            name="razon_social"
            defaultValue={config?.razon_social ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Deleites Panadería y Fiambrería"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              CUIT
            </label>
            <input
              name="cuit"
              defaultValue={config?.cuit ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="30-12345678-9"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Condición frente al IVA
            </label>
            <select
              name="condicion_iva"
              defaultValue={config?.condicion_iva ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">Elegir...</option>
              <option value="responsable_inscripto">Responsable Inscripto</option>
              <option value="monotributo">Monotributista</option>
              <option value="exento">Exento</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Ingresos Brutos (opcional)
            </label>
            <input
              name="ingresos_brutos"
              defaultValue={config?.ingresos_brutos ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="N° de inscripción"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Inicio de actividades (opcional)
            </label>
            <input
              type="date"
              name="inicio_actividades"
              defaultValue={config?.inicio_actividades ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>
      </div>

      {state.error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="mt-3 text-sm text-green-600 dark:text-green-400">
          Guardado.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
