"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buscarVentaPorTicket,
  crearComprobante,
  type ItemComprobanteInput,
} from "../actions";
import { calcularIva, type TipoComprobante } from "@/lib/comprobantes";

type Item = ItemComprobanteInput & { key: number };

let contador = 0;
function nuevoItem(): Item {
  contador += 1;
  return { key: contador, descripcion: "", cantidad: 1, precioUnitario: 0 };
}

export function ComprobanteForm({
  tipo,
  sucursales,
  sucursalIdInicial,
}: {
  tipo: TipoComprobante;
  sucursales: { id: string; nombre: string }[];
  sucursalIdInicial: string;
}) {
  const router = useRouter();

  const [sucursalId, setSucursalId] = useState(sucursalIdInicial);
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteCuit, setClienteCuit] = useState("");
  const [clienteDomicilio, setClienteDomicilio] = useState("");
  const [clienteCondicionIva, setClienteCondicionIva] = useState("consumidor_final");
  const [porcentajeIva, setPorcentajeIva] = useState(21);
  const [observaciones, setObservaciones] = useState("");
  const [ventaId, setVentaId] = useState<string | null>(null);

  const [numeroTicket, setNumeroTicket] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorTicket, setErrorTicket] = useState<string | null>(null);

  const [items, setItems] = useState<Item[]>([nuevoItem()]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () => items.reduce((a, it) => a + (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0), 0),
    [items]
  );
  const { subtotal, iva } = useMemo(
    () => (tipo === "factura_a" ? calcularIva(total, porcentajeIva) : { subtotal: total, iva: 0 }),
    [tipo, total, porcentajeIva]
  );

  function actualizarItem(key: number, campo: keyof ItemComprobanteInput, valor: string | number) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, [campo]: valor } : it)));
  }

  function agregarItem() {
    setItems((prev) => [...prev, nuevoItem()]);
  }

  function quitarItem(key: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.key !== key) : prev));
  }

  async function buscarTicket() {
    const numero = Number(numeroTicket);
    if (!numero || numero <= 0) {
      setErrorTicket("Ingresá un número de ticket válido");
      return;
    }
    setBuscando(true);
    setErrorTicket(null);
    const resultado = await buscarVentaPorTicket(sucursalId, numero);
    setBuscando(false);

    if ("error" in resultado) {
      setErrorTicket(resultado.error);
      return;
    }

    setVentaId(resultado.venta.ventaId);
    setItems(
      resultado.venta.items.map((it) => ({
        key: (contador += 1),
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
      }))
    );
  }

  function quitarTicket() {
    setVentaId(null);
    setNumeroTicket("");
    setItems([nuevoItem()]);
  }

  async function enviar() {
    setError(null);
    const itemsLimpios = items
      .filter((it) => it.descripcion.trim() && it.cantidad > 0)
      .map(({ descripcion, cantidad, precioUnitario }) => ({ descripcion, cantidad, precioUnitario }));

    if (itemsLimpios.length === 0) {
      setError("Agregá al menos un ítem con descripción y cantidad");
      return;
    }
    if (tipo === "factura_a" && !clienteCuit.trim()) {
      setError("La Factura A necesita el CUIT del cliente");
      return;
    }

    setEnviando(true);
    const resultado = await crearComprobante({
      sucursalId,
      tipo,
      ventaId,
      clienteNombre,
      clienteCuit,
      clienteDomicilio,
      clienteCondicionIva,
      porcentajeIva: tipo === "factura_a" ? porcentajeIva : undefined,
      observaciones,
      items: itemsLimpios,
    });
    setEnviando(false);

    if ("error" in resultado) {
      setError(resultado.error);
      return;
    }
    router.push(`/admin/facturacion/${resultado.id}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Sucursal
            </label>
            <select
              value={sucursalId}
              onChange={(e) => setSucursalId(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          {tipo !== "presupuesto" && (
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                N° de ticket de venta (opcional)
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={numeroTicket}
                  onChange={(e) => setNumeroTicket(e.target.value)}
                  disabled={!!ventaId}
                  placeholder="Ej: 1234"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950"
                />
                {ventaId ? (
                  <button
                    type="button"
                    onClick={quitarTicket}
                    className="shrink-0 rounded-md border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Quitar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={buscarTicket}
                    disabled={buscando}
                    className="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    {buscando ? "Buscando..." : "Buscar"}
                  </button>
                )}
              </div>
              {errorTicket && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorTicket}</p>
              )}
              {ventaId && !errorTicket && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  Ticket encontrado, ítems cargados abajo.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Cliente</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Nombre {tipo === "factura_b" ? "(opcional, o Consumidor Final)" : ""}
            </label>
            <input
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder={tipo === "factura_b" ? "Consumidor Final" : "Nombre y apellido / Razón social"}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              CUIT {tipo === "factura_a" ? "*" : "(opcional)"}
            </label>
            <input
              value={clienteCuit}
              onChange={(e) => setClienteCuit(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="20-12345678-9"
            />
          </div>
          {(tipo === "remito" || tipo === "presupuesto") && (
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Domicilio de entrega (opcional)
              </label>
              <input
                value={clienteDomicilio}
                onChange={(e) => setClienteDomicilio(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          )}
          {tipo === "factura_a" && (
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Condición frente al IVA del cliente
              </label>
              <select
                value={clienteCondicionIva}
                onChange={(e) => setClienteCondicionIva(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="responsable_inscripto">Responsable Inscripto</option>
                <option value="monotributo">Monotributista</option>
                <option value="exento">Exento</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {tipo === "presupuesto" ? "Qué se presupuesta" : tipo === "remito" ? "Mercadería" : "Ítems"}
          </h2>
          {tipo === "factura_a" && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">IVA %</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={porcentajeIva}
                onChange={(e) => setPorcentajeIva(Number(e.target.value) || 0)}
                className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <div className="hidden grid-cols-[1fr_5rem_6rem_6rem_2rem] gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:grid">
            <span>Descripción</span>
            <span>Cant.</span>
            <span>P. unit.</span>
            <span>Subtotal</span>
            <span></span>
          </div>
          {items.map((it) => (
            <div key={it.key} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_5rem_6rem_6rem_2rem]">
              <input
                value={it.descripcion}
                onChange={(e) => actualizarItem(it.key, "descripcion", e.target.value)}
                placeholder="Descripción"
                className="col-span-2 rounded-md border border-zinc-300 px-2 py-1.5 text-sm sm:col-span-1 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={it.cantidad}
                onChange={(e) => actualizarItem(it.key, "cantidad", Number(e.target.value) || 0)}
                className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={it.precioUnitario}
                onChange={(e) => actualizarItem(it.key, "precioUnitario", Number(e.target.value) || 0)}
                className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <div className="flex items-center px-1 text-sm text-zinc-700 dark:text-zinc-300">
                ${(it.cantidad * it.precioUnitario).toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => quitarItem(it.key)}
                className="rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={agregarItem}
          className="mt-2 text-xs font-medium text-amber-700 hover:underline dark:text-amber-400"
        >
          + Agregar ítem
        </button>

        <div className="mt-4 border-t border-dashed border-zinc-300 pt-3 dark:border-zinc-700">
          {tipo === "factura_a" ? (
            <>
              <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <span>IVA ({porcentajeIva}%)</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div className="mt-1 flex justify-between text-base font-bold text-zinc-900 dark:text-zinc-50">
                <span>TOTAL</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-zinc-50">
              <span>TOTAL</span>
              <span>${total.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Observaciones (opcional)
        </label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder={
            tipo === "presupuesto"
              ? "Ej: válido por 15 días"
              : tipo === "remito"
                ? "Ej: entregado a..."
                : ""
          }
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        onClick={enviar}
        disabled={enviando}
        className="self-start rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {enviando ? "Generando..." : "Generar"}
      </button>
    </div>
  );
}
