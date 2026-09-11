"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registrarDeposito } from "./actions";
import { IconWallet } from "@/components/admin-icons";

export function DepositarButton({ sucursalId }: { sucursalId: string }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [monto, setMonto] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    const valor = Number(monto);
    if (!valor || valor <= 0) {
      setError("Ingresá un monto mayor a 0");
      return;
    }
    setPending(true);
    setError(null);
    const result = await registrarDeposito(sucursalId, valor);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setAbierto(false);
    setMonto("");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <IconWallet className="h-4 w-4" />
        Depositar
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Monto que estás depositando del efectivo de hoy. Se le va a avisar al superadmin.
          </p>
          <input
            type="number"
            step="0.01"
            min="0"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Monto *"
            autoFocus
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                setAbierto(false);
                setError(null);
              }}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              onClick={confirmar}
              disabled={pending}
              className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {pending ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
