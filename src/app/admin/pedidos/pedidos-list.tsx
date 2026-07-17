"use client";

import { useActionState, useRef, useState } from "react";
import {
  actualizarEstadoPedido,
  agregarItemPedido,
  eliminarItemPedido,
  eliminarPedido,
  type ActionState,
} from "./actions";
import { IconChevronDown } from "@/components/admin-icons";
import { DeleteButton } from "@/components/delete-button";
import { ComandaImprimible } from "./comanda-imprimible";

type Pedido = {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string | null;
  cliente_email: string | null;
  sucursal_id: string | null;
  tipo: string;
  estado: string;
  notas: string | null;
  total: number;
  fecha_evento: string | null;
  created_at: string;
  tipo_entrega?: string;
  direccion_entrega?: string | null;
  hora_retiro?: string | null;
  metodo_pago?: string | null;
  costo_envio?: number;
};

type Item = {
  id: string;
  pedido_id: string;
  producto_id: string | null;
  cantidad: number;
  precio_unitario: number;
};

const initialState: ActionState = {};

const ESTADOS = [
  "pendiente",
  "confirmado",
  "preparando",
  "listo",
  "entregado",
  "cancelado",
] as const;

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  confirmado: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  preparando: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  listo: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  entregado: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  cancelado: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function PedidosList({
  pedidos,
  sucursales,
  productos,
  items,
}: {
  pedidos: Pedido[];
  sucursales: { id: string; nombre: string }[];
  productos: { id: string; nombre: string; precio_base: number }[];
  items: Item[];
}) {
  const sucursalNombre = (id: string | null) =>
    sucursales.find((s) => s.id === id)?.nombre ?? "Sin sucursal";

  const [comanda, setComanda] = useState<{
    pedido: Pedido;
    items: Item[];
    sucursalNombre: string;
  } | null>(null);

  function imprimirComanda(pedido: Pedido, itemsPedido: Item[]) {
    setComanda({
      pedido,
      items: itemsPedido,
      sucursalNombre: sucursalNombre(pedido.sucursal_id),
    });
    setTimeout(() => window.print(), 50);
  }

  if (pedidos.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay pedidos cargados.
      </p>
    );
  }

  return (
    <>
      <div className="no-print flex flex-col gap-3">
        {pedidos.map((p) => (
          <PedidoCard
            key={p.id}
            pedido={p}
            sucursalNombre={sucursalNombre(p.sucursal_id)}
            productos={productos}
            items={items.filter((it) => it.pedido_id === p.id)}
            onImprimirComanda={imprimirComanda}
          />
        ))}
      </div>
      <ComandaImprimible
        comanda={comanda}
        productos={productos}
        sucursalNombre={comanda?.sucursalNombre ?? ""}
      />
    </>
  );
}

function PedidoCard({
  pedido,
  sucursalNombre,
  productos,
  items,
  onImprimirComanda,
}: {
  pedido: Pedido;
  sucursalNombre: string;
  productos: { id: string; nombre: string; precio_base: number }[];
  items: Item[];
  onImprimirComanda: (pedido: Pedido, items: Item[]) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const agregarItemConId = agregarItemPedido.bind(null, pedido.id);
  const [state, formAction, pending] = useActionState(
    agregarItemConId,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  const actualizarEstadoConId = actualizarEstadoPedido.bind(null, pedido.id);
  const [estadoState, estadoAction] = useActionState(
    actualizarEstadoConId,
    initialState
  );

  const nombreProducto = (id: string | null) =>
    productos.find((p) => p.id === id)?.nombre ?? "Producto eliminado";

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            {pedido.cliente_nombre}{" "}
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLOR[pedido.estado]}`}
            >
              {pedido.estado}
            </span>
            <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {pedido.tipo === "evento" ? "Evento" : "Online"}
            </span>
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {[pedido.cliente_telefono, sucursalNombre].filter(Boolean).join(" · ")}
            {pedido.fecha_evento ? ` · Evento: ${pedido.fecha_evento}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {pedido.tipo_entrega === "envio"
              ? `Envío a: ${pedido.direccion_entrega || "(sin dirección)"}`
              : pedido.hora_retiro
                ? `Retira a las ${pedido.hora_retiro}`
                : "Retiro en sucursal"}
            {pedido.metodo_pago ? ` · Pago: ${pedido.metodo_pago}` : ""}
          </p>
          {pedido.notas && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {pedido.notas}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end gap-1">
            <form action={estadoAction}>
              <select
                name="estado"
                defaultValue={pedido.estado}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </form>
            {estadoState.error && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {estadoState.error}
              </p>
            )}
          </div>
          <DeleteButton
            action={() => eliminarPedido(pedido.id)}
            label="Eliminar pedido"
          />
          {items.length > 0 && (
            <button
              onClick={() => onImprimirComanda(pedido, items)}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Imprimir comanda
            </button>
          )}
          <button
            onClick={() => setAbierto((v) => !v)}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ${Number(pedido.total).toFixed(2)}
            <IconChevronDown
              className={`h-4 w-4 transition-transform ${abierto ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {abierto && (
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          {items.length > 0 && (
            <ul className="mb-3 flex flex-col gap-1.5">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span>
                    {it.cantidad} × {nombreProducto(it.producto_id)}
                  </span>
                  <span className="flex items-center gap-2">
                    ${(Number(it.cantidad) * Number(it.precio_unitario)).toFixed(2)}
                    <DeleteButton
                      action={() => eliminarItemPedido(it.id, pedido.id)}
                      label="Quitar item"
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}

          <form
            ref={formRef}
            action={async (formData) => {
              await formAction(formData);
              formRef.current?.reset();
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <select
              name="producto_id"
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">Producto...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (${p.precio_base.toFixed(2)})
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              name="cantidad"
              placeholder="Cant."
              className="w-20 rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {pending ? "..." : "Agregar item"}
            </button>
          </form>
          {state.error && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
