"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { labelMetodoPago } from "@/lib/metodos-pago";
import { formatFechaHoraAR } from "@/lib/fecha-ar";

type FormaPago = { metodo: string | null; monto: number };
type Extra = { etiqueta: string; monto: number; signo: "+" | "-" | null };
type Seccion = {
  clave: string;
  etiqueta: string;
  formasPago: FormaPago[];
  extras: Extra[];
  total: number;
};

export function ArqueoView({
  sucursales,
  sucursalId,
  sucursalNombre,
  generadoEn,
  secciones,
  totalGeneral,
}: {
  sucursales: { id: string; nombre: string }[];
  sucursalId: string;
  sucursalNombre: string;
  generadoEn: string;
  secciones: Seccion[];
  totalGeneral: number;
}) {
  const router = useRouter();

  return (
    <div className="p-8">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Arqueo de caja
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Ventas de hoy separadas por Venta 1 y Venta Deleite, con subtotales y total.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sucursalId}
            onChange={(e) => router.push(`/admin/caja/arqueo?sucursal=${e.target.value}`)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
          <button
            onClick={() => router.refresh()}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Actualizar
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Imprimir
          </button>
          <Link
            href={`/admin/caja?sucursal=${sucursalId}`}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Volver a Caja
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-lg rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50">
        <p className="text-center font-bold">Arqueo de caja</p>
        <p className="text-center text-zinc-600 dark:text-zinc-400">{sucursalNombre}</p>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          {formatFechaHoraAR(generadoEn)}
        </p>

        {secciones.length === 0 ? (
          <p className="mt-4 text-center text-zinc-500 dark:text-zinc-400">
            Todavía no hay ventas registradas hoy.
          </p>
        ) : (
          secciones.map((s) => (
            <div key={s.clave}>
              <div className="my-3 border-t border-dashed border-zinc-300 dark:border-zinc-700" />
              <p className="font-semibold">{s.etiqueta}</p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {s.formasPago.map((f) => (
                  <li key={f.metodo ?? "sin_especificar"} className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {labelMetodoPago(f.metodo)}
                    </span>
                    <span>${f.monto.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              {s.extras.map((e) => (
                <div key={e.etiqueta} className="mt-1 flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">{e.etiqueta}</span>
                  <span>
                    {e.signo === "-" ? "-" : e.signo === "+" ? "+" : ""}$
                    {e.monto.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="mt-1 flex justify-between font-semibold">
                <span>Subtotal {s.etiqueta}</span>
                <span>${s.total.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}

        <div className="my-3 border-t border-dashed border-zinc-300 dark:border-zinc-700" />

        <div className="flex justify-between text-base font-bold">
          <span>TOTAL GENERAL</span>
          <span>${totalGeneral.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
