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
}: {
  sucursales: { id: string; nombre: string }[];
  sucursalIdInicial: string;
  productos: Producto[];
  precios: Precio[];
}) {
  const router = useRouter();
  const [sucursalId, setSucursalId] = useState(sucursalIdInicial);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ventaCompletada, setVentaCompletada] = useState<VentaCreada | null>(
    null
  );

  function precioDe(producto: Producto) {
    const override = precios.find(
      (p) => p.producto_id === producto.id && p.sucursal_id === sucursalId
    );
    return override ? Number(override.precio) : Number(producto.precio_base);
  }

  function agregarProducto(producto: Producto) {
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
          productoId: producto.id,
          nombre: producto.nombre,
          cantidad: 1,
          precioUnitario: precioDe(producto),
          unidadMedida: producto.unidad_medida ?? "unidad",
        },
      ];
    });
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

  function actualizarCantidad(productoId: string, cantidad: number) {
    setCarrito((prev) =>
      cantidad <= 0
        ? prev.filter((i) => i.productoId !== productoId)
        : prev.map((i) => (i.productoId === productoId ? { ...i, cantidad } : i))
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
    setPending(true);
    setError(null);

    const result = await crearVenta({ sucursalId, metodoPago, items: carrito });

    setPending(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setVentaCompletada(result.venta);
    setCarrito([]);
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
                ${precioDe(p).toFixed(2)}
                {p.unidad_medida && p.unidad_medida !== "unidad" && (
                  <span className="text-zinc-500 dark:text-zinc-400">
                    /{UNIDAD_LABEL[p.unidad_medida]}
                  </span>
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
                key={it.productoId}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                  {it.nombre}
                </span>
                <input
                  type="number"
                  min={esFraccionable(it.unidadMedida) ? "0.01" : "1"}
                  step={esFraccionable(it.unidadMedida) ? "0.01" : "1"}
                  value={it.cantidad}
                  onChange={(e) =>
                    actualizarCantidad(it.productoId, Number(e.target.value))
                  }
                  className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
                <span className="w-8 text-xs text-zinc-500 dark:text-zinc-400">
                  {UNIDAD_LABEL[it.unidadMedida ?? "unidad"]}
                </span>
                <span className="w-20 text-right text-zinc-900 dark:text-zinc-50">
                  ${(it.cantidad * it.precioUnitario).toFixed(2)}
                </span>
                <button
                  onClick={() => actualizarCantidad(it.productoId, 0)}
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
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
          <option value="mercadopago">MercadoPago</option>
        </select>

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
    </div>
  );
}
