"use client";

import { eliminarAviso } from "./actions";
import { DeleteButton } from "@/components/delete-button";

type Aviso = {
  id: string;
  mensaje: string;
  perfil_id: string | null;
  fecha: string;
};

export function AvisosList({
  avisos,
  empleados,
}: {
  avisos: Aviso[];
  empleados: { id: string; nombre: string }[];
}) {
  if (avisos.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay avisos cargados.
      </p>
    );
  }

  const nombreEmpleado = (id: string | null) =>
    id ? (empleados.find((e) => e.id === id)?.nombre ?? "Empleado") : "Todos los empleados";

  return (
    <ul className="flex flex-col gap-2">
      {avisos.map((a) => (
        <li
          key={a.id}
          className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm text-zinc-800 dark:text-zinc-200">{a.mensaje}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {nombreEmpleado(a.perfil_id)} ·{" "}
              {new Date(a.fecha + "T00:00:00").toLocaleDateString("es-AR")}
            </p>
          </div>
          <DeleteButton action={() => eliminarAviso(a.id)} label="Eliminar aviso" />
        </li>
      ))}
    </ul>
  );
}
