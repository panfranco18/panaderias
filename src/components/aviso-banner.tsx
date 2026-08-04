"use client";

import { useState } from "react";
import { IconMegaphone, IconX } from "@/components/admin-icons";

type Aviso = { id: string; mensaje: string };

export function AvisoBanner({ avisos }: { avisos: Aviso[] }) {
  const [ocultos, setOcultos] = useState<string[]>([]);
  const visibles = avisos.filter((a) => !ocultos.includes(a.id));

  if (visibles.length === 0) return null;

  return (
    <div className="no-print flex flex-col gap-2 p-4 pb-0">
      {visibles.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          <IconMegaphone className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{a.mensaje}</span>
          <button
            onClick={() => setOcultos((prev) => [...prev, a.id])}
            aria-label="Ocultar aviso"
            className="shrink-0 text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
