"use client";

import { useRouter } from "next/navigation";

export function SucursalSelector({
  sucursales,
  actual,
}: {
  sucursales: { id: string; nombre: string }[];
  actual?: string;
}) {
  const router = useRouter();

  if (sucursales.length === 0) return null;

  return (
    <select
      defaultValue={actual}
      onChange={(e) => router.push(`/admin/stock?sucursal=${e.target.value}`)}
      className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
    >
      {sucursales.map((s) => (
        <option key={s.id} value={s.id}>
          {s.nombre}
        </option>
      ))}
    </select>
  );
}
