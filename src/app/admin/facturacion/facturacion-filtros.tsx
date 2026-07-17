"use client";

import { useRouter } from "next/navigation";

export function FacturacionFiltros({
  sucursales,
  sucursalId,
  fecha,
}: {
  sucursales: { id: string; nombre: string }[];
  sucursalId?: string;
  fecha: string;
}) {
  const router = useRouter();

  function actualizar(nuevaSucursal: string, nuevaFecha: string) {
    router.push(`/admin/facturacion?sucursal=${nuevaSucursal}&fecha=${nuevaFecha}`);
  }

  if (sucursales.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        defaultValue={sucursalId}
        onChange={(e) => actualizar(e.target.value, fecha)}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      >
        {sucursales.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre}
          </option>
        ))}
      </select>
      <input
        type="date"
        defaultValue={fecha}
        onChange={(e) => actualizar(sucursalId ?? "", e.target.value)}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />
    </div>
  );
}
