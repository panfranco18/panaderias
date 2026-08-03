"use client";

import { useState, useActionState } from "react";
import { actualizarContrato, eliminarContrato, type ActionState } from "./actions";
import { DeleteButton } from "@/components/delete-button";

type Contrato = {
  id: string;
  local: string;
  sucursal_id: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  aumentos: string | null;
  arreglos: string | null;
  observaciones: string | null;
  titular: string | null;
  inmobiliaria: string | null;
};

const initialState: ActionState = {};

export function ContratosList({
  contratos,
  sucursales,
}: {
  contratos: Contrato[];
  sucursales: { id: string; nombre: string }[];
}) {
  if (contratos.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay contratos cargados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {contratos.map((c) => (
        <ContratoCard key={c.id} contrato={c} sucursales={sucursales} />
      ))}
    </div>
  );
}

function ContratoCard({
  contrato,
  sucursales,
}: {
  contrato: Contrato;
  sucursales: { id: string; nombre: string }[];
}) {
  const [editando, setEditando] = useState(false);
  const actualizarConId = actualizarContrato.bind(null, contrato.id);
  const [state, formAction, pending] = useActionState(actualizarConId, initialState);

  if (state.ok && editando) setEditando(false);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            {contrato.local}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {[contrato.titular, contrato.inmobiliaria].filter(Boolean).join(" · ") ||
              "Sin titular/inmobiliaria cargados"}
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
            action={() => eliminarContrato(contrato.id)}
            label="Eliminar contrato"
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
              name="local"
              defaultValue={contrato.local}
              required
              placeholder="Local *"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <select
              name="sucursal_id"
              defaultValue={contrato.sucursal_id ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">Vincular a sucursal...</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            <input
              name="titular"
              defaultValue={contrato.titular ?? ""}
              placeholder="Titular"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="inmobiliaria"
              defaultValue={contrato.inmobiliaria ?? ""}
              placeholder="Inmobiliaria"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Inicio del contrato
              </label>
              <input
                type="date"
                name="fecha_inicio"
                defaultValue={contrato.fecha_inicio ?? ""}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Fin del contrato
              </label>
              <input
                type="date"
                name="fecha_fin"
                defaultValue={contrato.fecha_fin ?? ""}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <textarea
              name="aumentos"
              defaultValue={contrato.aumentos ?? ""}
              rows={2}
              placeholder="Aumentos previstos"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <textarea
              name="arreglos"
              defaultValue={contrato.arreglos ?? ""}
              rows={2}
              placeholder="Arreglos"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <textarea
              name="observaciones"
              defaultValue={contrato.observaciones ?? ""}
              rows={2}
              placeholder="Observaciones"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
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
