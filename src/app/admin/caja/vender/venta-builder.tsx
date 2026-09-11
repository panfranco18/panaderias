"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { crearVenta, type ItemCarrito, type VentaCreada } from "./actions";
import { BarcodeScannerButton } from "./barcode-scanner";
import { TicketView } from "./ticket-view";
import { IconTrash } from "@/components/admin-icons";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  precio_base: number;
  codigo_barras: string | null;
  unidad_medida?: string;
  monto_variable?: boolean;
};

const UNIDAD_LABEL: Record<string, string> = {
  unidad: "u.",
  kg: "kg",
  gramo: "g",
  docena: "doc.",
};

function esFraccionable(unidad?: string) {
  return unidad === "kg" || unidad === "gramo";
}

type Precio = { producto_id: string; sucursal_id: string; precio: number };

export function VentaBuilder({
  sucursales,
  sucursalIdInicial,
  productos,
  precios,
  nombreEmpleado,
}: {
  sucursales: { id: string; nombre: string }[];
  sucursalIdInicial: string;
  productos: Producto[];
  precios: Precio[];
  nombreEmpleado: string;
}) {
  const router = useRouter();
  const [sucursalId, setSucursalId] = useState(sucursalIdInicial);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [esVenta1, setEsVenta1] = useState(false);
  const [esVentaDeleite, setEsVentaDeleite] = useState(false);
  const [avisoVentaTipo, setAvisoVentaTipo] = useState<"ninguna" | "ambas" | null>(
    null
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ventaCompletada, setVentaCompletada] = useState<VentaCreada | null>(
    null
  );
  const [pidiendoMontoPara, setPidiendoMontoPara] = useState<Producto | null>(
    null
  );
  const [montoIngresado, setMontoIngresado] = useState("");

  function precioDe(producto: Producto) {
    const override = precios.find(
      (p) => p.producto_id === producto.id && p.sucursal_id === sucursalId
    );
    return override ? Number(override.precio) : Number(producto.precio_base);
  }

  function agregarProducto(producto: Producto) {
    if (producto.monto_variable) {
      setMontoIngresado("");
      setPidiendoMontoPara(producto);
      return;
    }

    setCarrito((prev) => {
      const existente = prev.find((i) => i.productoId === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.productoId === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: producto.id,
          productoId: producto.id,
          nombre: producto.nombre,
          cantidad: 1,
          precioUnitario: precioDe(producto),
          unidadMedida: producto.unidad_medida ?? "unidad",
        },
      ];
    });
  }

  function confirmarMontoVariable() {
    const producto = pidiendoMontoPara;
    if (!producto) return;
    const monto = Number(montoIngresado);
    if (!monto || monto <= 0) {
      setError("Ingresá un monto mayor a 0");
      return;
    }
    setError(null);
    setCarrito((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precioUnitario: monto,
        montoVariable: true,
      },
    ]);
    setPidiendoMontoPara(null);
  }

  function agregarPorCodigoBarras(codigo: string) {
    const producto = productos.find((p) => p.codigo_barras === codigo);
    if (!producto) {
      setError(`Ningún producto tiene el código "${codigo}"`);
      return;
    }
    setError(null);
    agregarProducto(producto);
  }

  function actualizarCantidad(id: string, cantidad: number) {
    setCarrito((prev) =>
      cantidad <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, cantidad } : i))
    );
  }

  function actualizarMonto(id: string, monto: number) {
    setCarrito((prev) =>
      prev.map((i) => (i.id === id ? { ...i, precioUnitario: monto } : i))
    );
  }

  const total = useMemo(
    () => carrito.reduce((a, i) => a + i.cantidad * i.precioUnitario, 0),
    [carrito]
  );

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter((p) => p.nombre.toLowerCase().includes(q));
  }, [busqueda, productos]);

  async function cobrar() {
    if (!esVenta1 && !esVentaDeleite) {
      setAvisoVentaTipo("ninguna");
      return;
    }
    if (esVenta1 && esVentaDeleite) {
      setAvisoVentaTipo("ambas");
      return;
    }

    setPending(true);
    setError(null);

    const result = await crearVenta({
      sucursalId,
      metodoPago,
      ventaTipo: esVenta1 ? "venta_1" : "venta_deleite",
      items: carrito,
    });

    setPending(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setVentaCompletada(result.venta);
    setCarrito([]);
    setEsVenta1(false);
    setEsVentaDeleite(false);
  }

  if (ventaCompletada) {
    return (
      <TicketView
        venta={ventaCompletada}
        onNuevaVenta={() => setVentaCompletada(null)}
      />
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sucursalId}
            onChange={(e) => {
              setSucursalId(e.target.value);
              router.push(`/admin/caja/vender?sucursal=${e.target.value}`);
            }}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
          <BarcodeScannerButton onDetected={agregarPorCodigoBarras} />
        </div>

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto..."
          className="mt-3 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />

        <div className="mt-3 flex max-h-96 flex-col gap-1.5 overflow-y-auto">
          {productosFiltrados.map((p) => (
            <button
              key={p.id}
              onClick={() => agregarProducto(p)}
              className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-left text-sm hover:border-amber-300 hover:bg-amber-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-amber-950"
            >
              <span className="text-zinc-800 dark:text-zinc-200">
                {p.nombre}
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {p.monto_variable ? (
                  <span className="text-xs font-normal text-amber-700 dark:text-amber-400">
                    Ingresar monto
                  </span>
                ) : (
                  <>
                    ${precioDe(p).toFixed(2)}
                    {p.unidad_medida && p.unidad_medida !== "unidad" && (
                      <span className="text-zinc-500 dark:text-zinc-400">
                        /{UNIDAD_LABEL[p.unidad_medida]}
                      </span>
                    )}
                  </>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Carrito
        </h2>
        {carrito.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Todavía no agregaste productos.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {carrito.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                  {it.nombre}
                </span>
                {it.montoVariable ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      $
                    </span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={it.precioUnitario}
                      onChange={(e) =>
                        actualizarMonto(it.id, Number(e.target.value))
                      }
                      className="w-24 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>
                ) : (
                  <>
                    <input
                      type="number"
                      min={esFraccionable(it.unidadMedida) ? "0.01" : "1"}
                      step={esFraccionable(it.unidadMedida) ? "0.01" : "1"}
                      value={it.cantidad}
                      onChange={(e) =>
                        actualizarCantidad(it.id, Number(e.target.value))
                      }
                      className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                    />
                    <span className="w-8 text-xs text-zinc-500 dark:text-zinc-400">
                      {UNIDAD_LABEL[it.unidadMedida ?? "unidad"]}
                    </span>
                  </>
                )}
                <span className="w-20 text-right text-zinc-900 dark:text-zinc-50">
                  ${(it.cantidad * it.precioUnitario).toFixed(2)}
                </span>
                <button
                  onClick={() => actualizarCantidad(it.id, 0)}
                  aria-label="Quitar"
                  className="text-zinc-400 hover:text-red-600"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
          className="mt-3 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="efectivo">Efectivo</option>
          <option value="posnet">Posnet</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
          <option value="mercadopago">MercadoPago</option>
        </select>

        <div className="mt-3 flex items-center gap-4 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-700">
          <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={esVenta1}
              onChange={(e) => setEsVenta1(e.target.checked)}
              className="rounded"
            />
            Venta 1
          </label>
          <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={esVentaDeleite}
              onChange={(e) => setEsVentaDeleite(e.target.checked)}
              className="rounded"
            />
            Venta Deleite
          </label>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={cobrar}
          disabled={pending || carrito.length === 0}
          className="mt-4 w-full rounded-full bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {pending ? "Cobrando..." : `Cobrar $${total.toFixed(2)}`}
        </button>
      </div>

      {pidiendoMontoPara && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPidiendoMontoPara(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-4 shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {pidiendoMontoPara.nombre}
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Ingresá el importe de esta venta.
            </p>
            <input
              type="number"
              min="0.01"
              step="0.01"
              autoFocus
              value={montoIngresado}
              onChange={(e) => setMontoIngresado(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmarMontoVariable()}
              placeholder="0.00"
              className="mt-3 w-full rounded-md border border-zinc-300 px-3 py-2 text-lg dark:border-zinc-700 dark:bg-zinc-950"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPidiendoMontoPara(null)}
                className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarMontoVariable}
                className="flex-1 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {avisoVentaTipo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setAvisoVentaTipo(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {nombreEmpleado}
            </h3>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {avisoVentaTipo === "ninguna"
                ? "Por favor, no te olvides de tildar o Venta 1 o Venta Deleites, ¡gracias!!"
                : "Por favor, optá por alguna de las dos, las dos no pueden tildarse, ¡muchas gracias!!!"}
            </p>
            <button
              onClick={() => setAvisoVentaTipo(null)}
              className="mt-4 w-full rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
