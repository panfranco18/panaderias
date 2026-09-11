"use client";

import { useEffect, useState } from "react";
import { avisarCierreDemorado } from "./actions";
import { debeAvisarCierreProximo, type ConfigTurnoCaja } from "@/lib/turno-caja";

export function AvisoCierreProximo({
  sucursalId,
  nombreEmpleado,
  config,
  cierreXHechoHoy,
}: {
  sucursalId: string;
  nombreEmpleado: string;
  config: ConfigTurnoCaja;
  cierreXHechoHoy: boolean;
}) {
  const [mostrar, setMostrar] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    function revisar() {
      setMostrar(debeAvisarCierreProximo(config, cierreXHechoHoy));
    }
    revisar();
    const intervalo = setInterval(revisar, 60000);
    return () => clearInterval(intervalo);
  }, [config, cierreXHechoHoy]);

  if (!mostrar || dismissed) return null;

  async function seguir() {
    setEnviando(true);
    await avisarCierreDemorado(sucursalId);
    setEnviando(false);
    setDismissed(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl dark:bg-zinc-900">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {nombreEmpleado}
        </h3>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Tenés que hacer el <b>Cierre X</b> antes de que termine tu turno mañana
          ({config.turno_manana_fin.slice(0, 5)}).
        </p>
        <button
          onClick={seguir}
          disabled={enviando}
          className="mt-4 w-full rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {enviando ? "Un momento..." : "Sigo"}
        </button>
      </div>
    </div>
  );
}
