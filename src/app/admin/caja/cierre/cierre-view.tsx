"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { labelMetodoPago } from "@/lib/metodos-pago";
import { formatHoraAR, formatFechaHoraAR } from "@/lib/fecha-ar";

type FormaPago = { metodo: string | null; monto: number };
type Gasto = { tipo: string; monto: number; descripcion: string | null; fecha: string };
type PersonalTurno = { nombre: string; hora: string | null };

type VentasTarde = { formasPago: FormaPago[]; total: number };

const TITULO: Record<string, string> = {
  x: "Cierre X — turno mañana",
  z: "Cierre Z — cierre del día",
};

export function CierreView({
  sucursales,
  sucursalId,
  sucursalNombre,
  generadoEn,
  tipo,
  formasPago,
  totalVentas,
  totales,
  saldo,
  gastos,
  personalEnTurno,
  ventasTarde,
}: {
  sucursales: { id: string; nombre: string }[];
  sucursalId: string;
  sucursalNombre: string;
  generadoEn: string;
  tipo?: "x" | "z" | null;
  formasPago: FormaPago[];
  totalVentas: number;
  totales: { apertura: number; ingresos: number; egresos: number; cierre: number };
  saldo: number;
  gastos: Gasto[];
  personalEnTurno: PersonalTurno[];
  ventasTarde?: VentasTarde;
}) {
  const router = useRouter();
  const titulo = tipo ? TITULO[tipo] : "Cierre de caja";

  return (
    <div className="p-8">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {titulo}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {tipo === "x"
              ? "Corte parcial de la mañana, sin cerrar el día."
              : tipo === "z"
                ? "Cierre del día: total de la tarde y total general."
                : "Estado de la caja hasta este momento, sin cerrar el día."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sucursalId}
            onChange={(e) =>
              router.push(
                `/admin/caja/cierre?sucursal=${e.target.value}${tipo ? `&tipo=${tipo}` : ""}`
              )
            }
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
        <p className="text-center font-bold">{titulo}</p>
        <p className="text-center text-zinc-600 dark:text-zinc-400">
          {sucursalNombre}
        </p>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          {formatFechaHoraAR(generadoEn)}
        </p>

        <div className="my-3 border-t border-dashed border-zinc-300 dark:border-zinc-700" />

        <p className="font-semibold">Personal en turno ahora</p>
        {personalEnTurno.length === 0 ? (
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Nadie fichado ahora.
          </p>
        ) : (
          <ul className="mt-1 flex flex-col gap-0.5">
            {personalEnTurno.map((p) => (
              <li key={p.nombre} className="flex justify-between">
                <span>{p.nombre}</span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {p.hora ? formatHoraAR(p.hora) : ""}
                </span>
              </li>
            ))}
          </ul>
        )}

        {ventasTarde && (
          <>
            <div className="my-3 border-t border-dashed border-zinc-300 dark:border-zinc-700" />

            <p className="font-semibold">Ventas de la tarde</p>
            {ventasTarde.formasPago.length === 0 ? (
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                Todavía no hay ventas registradas en el turno tarde.
              </p>
            ) : (
              <ul className="mt-1 flex flex-col gap-0.5">
                {ventasTarde.formasPago.map((f) => (
                  <li key={f.metodo ?? "sin_especificar"} className="flex justify-between">
                    <span>{labelMetodoPago(f.metodo)}</span>
                    <span>${f.monto.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-1 flex justify-between font-semibold">
              <span>Total vendido a la tarde</span>
              <span>${ventasTarde.total.toFixed(2)}</span>
            </div>
          </>
        )}

        <div className="my-3 border-t border-dashed border-zinc-300 dark:border-zinc-700" />

        <p className="font-semibold">
          {ventasTarde ? "Total del día por forma de pago" : "Ventas de hoy por forma de pago"}
        </p>
        {formasPago.length === 0 ? (
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Todavía no hay ventas registradas hoy.
          </p>
        ) : (
          <ul className="mt-1 flex flex-col gap-0.5">
            {formasPago.map((f) => (
              <li key={f.metodo ?? "sin_especificar"} className="flex justify-between">
                <span>{labelMetodoPago(f.metodo)}</span>
                <span>${f.monto.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-1 flex justify-between font-semibold">
          <span>Total vendido hoy</span>
          <span>${totalVentas.toFixed(2)}</span>
        </div>

        <div className="my-3 border-t border-dashed border-zinc-300 dark:border-zinc-700" />

        <p className="font-semibold">Movimientos de caja</p>
        <ul className="mt-1 flex flex-col gap-0.5">
          <li className="flex justify-between">
            <span>Apertura</span>
            <span>${totales.apertura.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Ingresos manuales</span>
            <span>${totales.ingresos.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Egresos / gastos</span>
            <span>-${totales.egresos.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Cierre registrado</span>
            <span>${totales.cierre.toFixed(2)}</span>
          </li>
        </ul>

        {gastos.length > 0 && (
          <>
            <p className="mt-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Detalle de gastos de hoy
            </p>
            <ul className="mt-1 flex flex-col gap-0.5 text-xs">
              {gastos.map((g, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {formatHoraAR(g.fecha)} — {g.descripcion || "Sin descripción"}
                  </span>
                  <span>${Number(g.monto).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="my-3 border-t border-dashed border-zinc-300 dark:border-zinc-700" />

        <div className="flex justify-between text-base font-bold">
          <span>SALDO EN CAJA</span>
          <span>${saldo.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
