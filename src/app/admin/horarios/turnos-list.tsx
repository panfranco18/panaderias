"use client";

import { eliminarTurno } from "./actions";
import { DeleteButton } from "@/components/delete-button";

type Turno = {
  id: string;
  perfil_id: string;
  sucursal_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  notas: string | null;
};

export function TurnosList({
  turnos,
  empleados,
  sucursales,
}: {
  turnos: Turno[];
  empleados: { id: string; nombre: string }[];
  sucursales: { id: string; nombre: string }[];
}) {
  if (turnos.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No hay turnos cargados para este período.
      </p>
    );
  }

  const nombreEmpleado = (id: string) =>
    empleados.find((e) => e.id === id)?.nombre ?? "Empleado";
  const nombreSucursal = (id: string) =>
    sucursales.find((s) => s.id === id)?.nombre ?? "Sucursal";

  const porDia = turnos.reduce<Record<string, Turno[]>>((acc, t) => {
    (acc[t.fecha] ??= []).push(t);
    return acc;
  }, {});
  const dias = Object.keys(porDia).sort();

  return (
    <div className="flex flex-col gap-6">
      {dias.map((dia) => (
        <div key={dia}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {new Date(dia + "T00:00:00").toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <div className="flex flex-col gap-2">
            {porDia[dia]
              .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {nombreEmpleado(t.perfil_id)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {nombreSucursal(t.sucursal_id)} · {t.hora_inicio.slice(0, 5)} a{" "}
                      {t.hora_fin.slice(0, 5)}
                      {t.notas ? ` · ${t.notas}` : ""}
                    </p>
                  </div>
                  <DeleteButton
                    action={() => eliminarTurno(t.id)}
                    label="Eliminar turno"
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
