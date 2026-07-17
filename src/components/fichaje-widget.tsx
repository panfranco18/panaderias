"use client";

import { useState, useTransition } from "react";
import { ficharEntrada, ficharSalida } from "@/app/admin/fichaje/actions";
import { IconClock } from "@/components/admin-icons";

export function FichajeWidget({
  estadoInicial,
}: {
  estadoInicial: "entrada" | "salida" | null;
}) {
  const [estado, setEstado] = useState(estadoInicial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const fichado = estado === "entrada";

  function marcar() {
    setError(null);
    startTransition(async () => {
      const result = fichado ? await ficharSalida() : await ficharEntrada();
      if (result.error) {
        setError(result.error);
        return;
      }
      setEstado(fichado ? "salida" : "entrada");
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={marcar}
        disabled={pending}
        className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50 ${
          fichado
            ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300"
            : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300"
        }`}
      >
        <IconClock className="h-4 w-4" />
        {pending
          ? "Guardando..."
          : fichado
            ? "Marcar salida"
            : "Marcar entrada"}
      </button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
