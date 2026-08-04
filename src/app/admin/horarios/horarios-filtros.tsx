"use client";

import { useRouter } from "next/navigation";

const PERIODOS = [
  { value: "dia", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
] as const;

export function HorariosFiltros({ periodo }: { periodo: string }) {
  const router = useRouter();

  return (
    <select
      defaultValue={periodo}
      onChange={(e) => router.push(`/admin/horarios?periodo=${e.target.value}`)}
      className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
    >
      {PERIODOS.map((p) => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
