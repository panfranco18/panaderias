"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { labelMetodoPago } from "@/lib/metodos-pago";
import { formatHoraAR, formatFechaAR } from "@/lib/fecha-ar";
import type { EstadoCajaRango } from "@/lib/estado-caja";

type ArqueoGuardado = {
  id: string;
  fecha: string;
  creadoEn: string;
  nombreEmpleado: string;
  totalVentas: number;
  totalValores: number;
  diferencia: number;
  observaciones: string | null;
};

type Cierre = {
  id: string;
  fecha: string;
  hora: string;
  tipo: string;
  nombreEmpleado: string;
  totalVentas: number | null;
};

export function HistorialView({
  sucursales,
  sucursalId,
  sucursalNombre,
  desde,
  hasta,
  generadoEn,
  estado,
  arqueosGuardados,
  cierres,
}: {
  sucursales: { id: string; nombre: string }[];
  sucursalId: string;
  sucursalNombre: string;
  desde: string;
  hasta: string;
  generadoEn: string;
  estado: EstadoCajaRango;
  arqueosGuardados: ArqueoGuardado[];
  cierres: Cierre[];
}) {
  const router = useRouter();
  const [sucursalSel, setSucursalSel] = useState(sucursalId);
  const [desdeSel, setDesdeSel] = useState(desde);
  const [hastaSel, setHastaSel] = useState(hasta);

  function buscar() {
    router.push(
      `/admin/caja/historial?sucursal=${sucursalSel}&desde=${desdeSel}&hasta=${hastaSel}`
    );
  }

  const esUnDia = desde === hasta;

  return (
    <div className="p-8">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Historial de cajas
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Elegí una sucursal y un rango de fechas para ver la caja de ese período.
          </p>
        </div>
        <Link
          href={`/admin/caja?sucursal=${sucursalId}`}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Volver a Caja
        </Link>
      </div>

      <div className="no-print mt-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Sucursal
          </label>
          <select
            value={sucursalSel}
            onChange={(e) => setSucursalSel(e.target.value)}
            className="mt-1 block rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Desde
          </label>
          <input
            type="date"
            value={desdeSel}
            onChange={(e) => setDesdeSel(e.target.value)}
            className="mt-1 block rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Hasta
          </label>
          <input
            type="date"
            value={hastaSel}
            onChange={(e) => setHastaSel(e.target.value)}
            className="mt-1 block rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <button
          onClick={buscar}
          className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Ver
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Imprimir
        </button>
      </div>

      <div className="mx-auto mt-6 max-w-lg rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50">
        <p className="text-center font-bold">Caja — {sucursalNombre}</p>
        <p className="text-center text-zinc-600 dark:text-zinc-400">
          {esUnDia ? formatFechaAR(`${desde}T12:00:00-03:00`) : `${formatFechaAR(`${desde}T12:00:00-03:00`)} al ${formatFechaAR(`${hasta}T12:00:00-03:00`)}`}
        </p>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Generado {formatHoraAR(generadoEn)}
        </p>

        <div className="my-3 border-t border-dashed border-zinc-300 dark:border-zinc-700" />

        <p className="font-semibold">Ventas por tipo</p>
        <ul className="mt-1 flex flex-col gap-0.5">
          <li className="flex justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Ventas 1</span>
            <span>${estado.ventaNegro.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Ventas Deleite</span>
            <span>${estado.ventaRegistrada.toFixed(2)}</span>
          </li>
          {estado.ventaSinClasificar > 0 && (
            <li className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Sin clasificar</span>
              <span>${estado.ventaSinClasificar.toFixed(2)}</span>
            </li>
          )}
        </ul>

        <div className="my-3 border-t border-dashed border-zinc-300 dark:border-zinc-700" />

        <p className="font-semibold">Ventas por forma de pago</p>
        {estado.formasPago.length === 0 ? (
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">Sin ventas en este período.</p>
        ) : (
          <ul className="mt-1 flex flex-col gap-0.5">
            {estado.formasPago.map((f) => (
              <li key={f.metodo ?? "sin_especificar"} className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">{labelMetodoPago(f.metodo)}</span>
                <span>${f.monto.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-1 flex justify-between font-semibold">
          <span>TOTAL VENTAS</span>
          <span>${estado.totalVentas.toFixed(2)}</span>
        </div>

        <div className="my-3 border-t border-dashed border-zinc-300 dark:border-zinc-700" />

        <p className="font-semibold">Movimientos de caja</p>
        <ul className="mt-1 flex flex-col gap-0.5">
          <li className="flex justify-between">
            <span>Apertura</span>
            <span>${estado.totales.apertura.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Ingresos manuales</span>
            <span>${estado.totales.ingresos.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Egresos / gastos</span>
            <span>-${estado.totales.egresos.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Depósitos</span>
            <span>-${estado.totales.depositos.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Cierre registrado</span>
            <span>${estado.totales.cierre.toFixed(2)}</span>
          </li>
        </ul>

        {estado.gastos.length > 0 && (
          <>
            <p className="mt-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Detalle de gastos
            </p>
            <ul className="mt-1 flex flex-col gap-0.5 text-xs">
              {estado.gastos.map((g, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {formatFechaAR(g.fecha)} {formatHoraAR(g.fecha)} — {g.descripcion || "Sin descripción"}
                  </span>
                  <span>${Number(g.monto).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {estado.depositosDelDia.length > 0 && (
          <>
            <p className="mt-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Detalle de depósitos
            </p>
            <ul className="mt-1 flex flex-col gap-0.5 text-xs">
              {estado.depositosDelDia.map((d, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {formatFechaAR(d.fecha)} {formatHoraAR(d.fecha)} — {d.descripcion || "Sin descripción"}
                  </span>
                  <span>${Number(d.monto).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="my-3 border-t border-dashed border-zinc-300 dark:border-zinc-700" />

        <div className="flex justify-between text-base font-bold">
          <span>SALDO</span>
          <span>${estado.saldo.toFixed(2)}</span>
        </div>
      </div>

      {!esUnDia && estado.porDia.length > 0 && (
        <div className="mx-auto mt-6 max-w-2xl">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">Desglose por día</p>
          <div className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2 text-right">Ventas 1</th>
                  <th className="px-3 py-2 text-right">Ventas Deleite</th>
                  <th className="px-3 py-2 text-right">Total ventas</th>
                  <th className="px-3 py-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {estado.porDia.map((d) => (
                  <tr key={d.fecha} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-3 py-2">{formatFechaAR(`${d.fecha}T12:00:00-03:00`)}</td>
                    <td className="px-3 py-2 text-right">${d.ventaNegro.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">${d.ventaRegistrada.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-medium">${d.totalVentas.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">${d.saldo.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="no-print mx-auto mt-6 max-w-2xl">
        <p className="font-semibold text-zinc-900 dark:text-zinc-50">
          Cierres X/Z en este período
        </p>
        {cierres.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No se hizo ningún Cierre X ni Z en este período.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {cierres.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span>
                  <b>Cierre {c.tipo.toUpperCase()}</b> — {c.nombreEmpleado} —{" "}
                  {formatFechaAR(c.fecha)} {formatHoraAR(c.hora)}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {c.totalVentas != null ? `$${c.totalVentas.toFixed(2)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="no-print mx-auto mt-6 max-w-2xl">
        <p className="font-semibold text-zinc-900 dark:text-zinc-50">
          Arqueos guardados en este período
        </p>
        {arqueosGuardados.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No se guardó ningún arqueo en este período.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {arqueosGuardados.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {a.nombreEmpleado} — {formatFechaAR(a.fecha)} {formatHoraAR(a.creadoEn)}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Ventas ${a.totalVentas.toFixed(2)} · Valores ${a.totalValores.toFixed(2)}
                    </p>
                    {a.observaciones && (
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{a.observaciones}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      Math.abs(a.diferencia) < 0.01
                        ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                    }`}
                  >
                    {Math.abs(a.diferencia) < 0.01 ? "Cerró" : `Dif. $${a.diferencia.toFixed(2)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
