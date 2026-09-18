"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { labelMetodoPago } from "@/lib/metodos-pago";
import { formatFechaHoraAR } from "@/lib/fecha-ar";
import { guardarArqueo, eliminarArqueo } from "./actions";
import { DeleteButton } from "@/components/delete-button";

type FormaPago = { metodo: string | null; monto: number };
type Extra = { etiqueta: string; monto: number; signo: "+" | "-" | null };
type Seccion = {
  clave: string;
  etiqueta: string;
  formasPago: FormaPago[];
  extras: Extra[];
  total: number;
};

type Comparacion = {
  ventas: { negro: number; registradas: number; sinClasificar: number; total: number };
  valores: {
    posnet: number;
    tarjeta: number;
    mercadopago: number;
    transferencias: number;
    depositos: number;
    gastos: number;
  };
};

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

export function ArqueoView({
  sucursales,
  sucursalId,
  sucursalNombre,
  generadoEn,
  secciones,
  totalGeneral,
  comparacion,
  arqueosGuardados,
  migracionPendiente,
}: {
  sucursales: { id: string; nombre: string }[];
  sucursalId: string;
  sucursalNombre: string;
  generadoEn: string;
  secciones: Seccion[];
  totalGeneral: number;
  comparacion: Comparacion;
  arqueosGuardados: ArqueoGuardado[];
  migracionPendiente: boolean;
}) {
  const router = useRouter();

  const [efectivoContado, setEfectivoContado] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const efectivo = Number(efectivoContado) || 0;
  const totalValores = useMemo(
    () =>
      comparacion.valores.posnet +
      comparacion.valores.tarjeta +
      comparacion.valores.mercadopago +
      comparacion.valores.transferencias +
      comparacion.valores.depositos +
      comparacion.valores.gastos +
      efectivo,
    [comparacion, efectivo]
  );
  const diferencia = comparacion.ventas.total - totalValores;
  const cierra = Math.abs(diferencia) < 0.01;

  async function guardar() {
    setError(null);
    setOk(false);
    setGuardando(true);
    const resultado = await guardarArqueo(sucursalId, efectivo, observaciones);
    setGuardando(false);

    if (resultado.error) {
      setError(resultado.error);
      return;
    }
    setOk(true);
    setEfectivoContado("");
    setObservaciones("");
    router.refresh();
  }

  return (
    <div className="p-8">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Arqueo de caja
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Comparación entre las ventas (en negro y registradas) y los valores de dinero
            del día — si está bien hecho, los dos totales tienen que dar igual.
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

      {migracionPendiente && (
        <p className="no-print mt-4 max-w-lg rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Todavía no se corrió la migración <code>supabase/022_arqueos_caja.sql</code>. La
          comparación de abajo funciona igual, pero no se va a poder guardar ni ver el
          historial hasta que se corra.
        </p>
      )}

      <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50">
        <p className="text-center font-bold">Comparación: Ventas vs Valores</p>
        <p className="text-center text-zinc-600 dark:text-zinc-400">{sucursalNombre}</p>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          {formatFechaHoraAR(generadoEn)}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="font-semibold">Ventas</p>
            <ul className="mt-1 flex flex-col gap-0.5">
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Ventas 1</span>
                <span>${comparacion.ventas.negro.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Ventas Deleite</span>
                <span>${comparacion.ventas.registradas.toFixed(2)}</span>
              </li>
              {comparacion.ventas.sinClasificar > 0 && (
                <li className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Sin clasificar</span>
                  <span>${comparacion.ventas.sinClasificar.toFixed(2)}</span>
                </li>
              )}
            </ul>
            <div className="mt-2 flex justify-between border-t border-dashed border-zinc-300 pt-1 font-semibold dark:border-zinc-700">
              <span>TOTAL VENTAS</span>
              <span>${comparacion.ventas.total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <p className="font-semibold">Valores</p>
            <ul className="mt-1 flex flex-col gap-0.5">
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Posnet</span>
                <span>${comparacion.valores.posnet.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Tarjeta</span>
                <span>${comparacion.valores.tarjeta.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Mercado Pago</span>
                <span>${comparacion.valores.mercadopago.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Transferencias</span>
                <span>${comparacion.valores.transferencias.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Depósitos</span>
                <span>${comparacion.valores.depositos.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Gastos</span>
                <span>${comparacion.valores.gastos.toFixed(2)}</span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-zinc-600 dark:text-zinc-400">Efectivo contado</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={efectivoContado}
                  onChange={(e) => setEfectivoContado(e.target.value)}
                  placeholder="0.00"
                  className="w-28 rounded-md border border-zinc-300 px-2 py-1 text-right text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </li>
            </ul>
            <div className="mt-2 flex justify-between border-t border-dashed border-zinc-300 pt-1 font-semibold dark:border-zinc-700">
              <span>TOTAL VALORES</span>
              <span>${totalValores.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="my-3 border-t border-zinc-300 dark:border-zinc-700" />

        <div
          className={`flex justify-between text-base font-bold ${
            cierra ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
          }`}
        >
          <span>{cierra ? "CIERRA ✓" : "DIFERENCIA"}</span>
          <span>${diferencia.toFixed(2)}</span>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Observaciones
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={2}
            placeholder="Algo que haya surgido en el momento..."
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {ok && <p className="mt-2 text-sm text-green-600 dark:text-green-400">Arqueo guardado.</p>}

        <button
          onClick={guardar}
          disabled={guardando || migracionPendiente}
          className="no-print mt-3 rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar arqueo"}
        </button>
      </div>

      <div className="mx-auto mt-6 max-w-lg rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50">
        <p className="text-center font-bold">Detalle por tipo de venta</p>

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

      {!migracionPendiente && (
        <div className="no-print mx-auto mt-6 max-w-2xl">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            Historial de arqueos guardados
          </p>
          {arqueosGuardados.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Todavía no se guardó ningún arqueo en esta sucursal.
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
                        {a.nombreEmpleado} — {formatFechaHoraAR(a.creadoEn)}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        Ventas ${a.totalVentas.toFixed(2)} · Valores ${a.totalValores.toFixed(2)}
                      </p>
                      {a.observaciones && (
                        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          {a.observaciones}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          Math.abs(a.diferencia) < 0.01
                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}
                      >
                        {Math.abs(a.diferencia) < 0.01 ? "Cierra" : `Dif. $${a.diferencia.toFixed(2)}`}
                      </span>
                      <DeleteButton
                        action={() => eliminarArqueo(a.id, sucursalId)}
                        label="Eliminar arqueo"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
