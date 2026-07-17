"use client";

import { useRouter } from "next/navigation";

const PERIODOS = [
  { value: "dia", label: "Hoy" },
  { value: "semana", label: "Últimos 7 días" },
  { value: "mes", label: "Últimos 30 días" },
] as const;

export function ReportesFiltros({
  sucursales,
  sucursalId,
  periodo,
}: {
  sucursales: { id: string; nombre: string }[];
  sucursalId?: string;
  periodo: string;
}) {
  const router = useRouter();

  function actualizar(nuevaSucursal: string, nuevoPeriodo: string) {
    router.push(`/admin/reportes?sucursal=${nuevaSucursal}&periodo=${nuevoPeriodo}`);
  }

  if (sucursales.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        defaultValue={sucursalId}
        onChange={(e) => actualizar(e.target.value, periodo)}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      >
        {sucursales.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre}
          </option>
        ))}
      </select>
      <select
        defaultValue={periodo}
        onChange={(e) => actualizar(sucursalId ?? "", e.target.value)}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      >
        {PERIODOS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}
