"use client";

import Link from "next/link";
import {
  CONDICION_IVA_LABEL,
  TIPO_COMPROBANTE_LABEL,
  formatNumeroComprobante,
  type TipoComprobante,
} from "@/lib/comprobantes";
import { formatFechaAR, formatFechaHoraAR } from "@/lib/fecha-ar";

type Comprobante = {
  id: string;
  tipo: TipoComprobante;
  puntoVenta: string;
  numero: number;
  fecha: string;
  clienteNombre: string | null;
  clienteCuit: string | null;
  clienteDomicilio: string | null;
  clienteCondicionIva: string | null;
  porcentajeIva: number;
  subtotal: number;
  iva: number;
  total: number;
  observaciones: string | null;
};

type Item = {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

type Sucursal = {
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  puntoVenta: string;
};

type Negocio = {
  razonSocial: string | null;
  cuit: string | null;
  condicionIva: string | null;
  ingresosBrutos: string | null;
  inicioActividades: string | null;
};

const LETRA: Record<TipoComprobante, string | null> = {
  factura_a: "A",
  factura_b: "B",
  remito: null,
  presupuesto: null,
};

export function ComprobanteView({
  comprobante,
  items,
  sucursal,
  negocio,
}: {
  comprobante: Comprobante;
  items: Item[];
  sucursal: Sucursal;
  negocio: Negocio;
}) {
  const letra = LETRA[comprobante.tipo];

  return (
    <div className="p-8">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {TIPO_COMPROBANTE_LABEL[comprobante.tipo]}{" "}
            {formatNumeroComprobante(comprobante.puntoVenta, comprobante.numero)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Imprimir
          </button>
          <Link
            href="/admin/facturacion"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Volver a Facturación
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-zinc-300 bg-white p-6 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-300 pb-3 dark:border-zinc-700">
          <div>
            <p className="text-base font-bold">{negocio.razonSocial || "Deleites Panadería y Fiambrería"}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{sucursal.nombre}</p>
            {sucursal.direccion && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{sucursal.direccion}</p>
            )}
            {sucursal.telefono && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Tel: {sucursal.telefono}</p>
            )}
            {negocio.cuit && (
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">CUIT: {negocio.cuit}</p>
            )}
            {negocio.condicionIva && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {CONDICION_IVA_LABEL[negocio.condicionIva] ?? negocio.condicionIva}
              </p>
            )}
            {negocio.ingresosBrutos && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">IIBB: {negocio.ingresosBrutos}</p>
            )}
            {negocio.inicioActividades && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Inicio de actividades: {formatFechaAR(negocio.inicioActividades)}
              </p>
            )}
          </div>
          <div className="text-right">
            {letra && (
              <div className="ml-auto mb-1 flex h-10 w-10 items-center justify-center border-2 border-zinc-900 text-lg font-bold dark:border-zinc-100">
                {letra}
              </div>
            )}
            <p className="font-bold uppercase">{TIPO_COMPROBANTE_LABEL[comprobante.tipo]}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              N° {formatNumeroComprobante(comprobante.puntoVenta, comprobante.numero)}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {formatFechaHoraAR(comprobante.fecha)}
            </p>
          </div>
        </div>

        <div className="border-b border-zinc-300 py-3 dark:border-zinc-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Cliente
          </p>
          <p className="mt-0.5">{comprobante.clienteNombre || "Consumidor Final"}</p>
          {comprobante.clienteCuit && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">CUIT: {comprobante.clienteCuit}</p>
          )}
          {comprobante.clienteCondicionIva && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {CONDICION_IVA_LABEL[comprobante.clienteCondicionIva] ?? comprobante.clienteCondicionIva}
            </p>
          )}
          {comprobante.clienteDomicilio && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{comprobante.clienteDomicilio}</p>
          )}
        </div>

        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 text-left text-xs uppercase text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              <th className="py-1.5">Descripción</th>
              <th className="py-1.5 text-right">Cant.</th>
              <th className="py-1.5 text-right">P. unit.</th>
              <th className="py-1.5 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5">{it.descripcion}</td>
                <td className="py-1.5 text-right">{it.cantidad}</td>
                <td className="py-1.5 text-right">${it.precioUnitario.toFixed(2)}</td>
                <td className="py-1.5 text-right">${it.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 flex flex-col items-end gap-0.5">
          {comprobante.tipo === "factura_a" ? (
            <>
              <div className="flex w-48 justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span>${comprobante.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex w-48 justify-between text-zinc-600 dark:text-zinc-400">
                <span>IVA ({comprobante.porcentajeIva}%)</span>
                <span>${comprobante.iva.toFixed(2)}</span>
              </div>
              <div className="flex w-48 justify-between border-t border-zinc-300 pt-1 text-base font-bold dark:border-zinc-700">
                <span>TOTAL</span>
                <span>${comprobante.total.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex w-48 justify-between border-t border-zinc-300 pt-1 text-base font-bold dark:border-zinc-700">
              <span>TOTAL</span>
              <span>${comprobante.total.toFixed(2)}</span>
            </div>
          )}
        </div>

        {comprobante.observaciones && (
          <div className="mt-3 border-t border-dashed border-zinc-300 pt-2 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            {comprobante.observaciones}
          </div>
        )}
      </div>
    </div>
  );
}
