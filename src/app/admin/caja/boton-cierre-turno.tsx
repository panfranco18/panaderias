"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registrarCierreTurno } from "./actions";

export function BotonCierreTurno({
  sucursalId,
  tipo,
}: {
  sucursalId: string;
  tipo: "x" | "z";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function click() {
    setPending(true);
    setError(null);
    const result = await registrarCierreTurno(sucursalId, tipo);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/admin/caja/cierre?sucursal=${sucursalId}&tipo=${tipo}`);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={click}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {pending ? "Generando..." : `Cierre ${tipo.toUpperCase()}`}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
