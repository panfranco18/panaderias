"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";
import { crearPedidoOnline } from "./actions";

type Sucursal = {
  nombre: string;
  horario_atencion: string | null;
  costo_envio: number;
};

type ConfigNegocio = {
  mercadopago_alias: string | null;
  mercadopago_titular: string | null;
  mercadopago_cbu: string | null;
};

export default function CheckoutPage() {
  const { items, sucursalId, total: totalItems, clear } = useCart();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<"retiro" | "envio">("retiro");
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [horaRetiro, setHoraRetiro] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<{
    tipoEntrega: "retiro" | "envio";
    direccionEntrega: string;
    horaRetiro: string;
    metodoPago: string;
    total: number;
  } | null>(null);

  const [sucursal, setSucursal] = useState<Sucursal | null>(null);
  const [config, setConfig] = useState<ConfigNegocio | null>(null);

  useEffect(() => {
    if (!sucursalId) return;
    const supabase = createClient();
    supabase
      .from("sucursales")
      .select("nombre, horario_atencion, costo_envio")
      .eq("id", sucursalId)
      .maybeSingle()
      .then(({ data }) => setSucursal(data));
  }, [sucursalId]);

  useEffect(() => {
    if (metodoPago !== "mercadopago") return;
    const supabase = createClient();
    supabase
      .from("configuracion_negocio")
      .select("mercadopago_alias, mercadopago_titular, mercadopago_cbu")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setConfig(data));
  }, [metodoPago]);

  const costoEnvio = tipoEntrega === "envio" ? sucursal?.costo_envio ?? 0 : 0;
  const total = useMemo(() => totalItems + costoEnvio, [totalItems, costoEnvio]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await crearPedidoOnline({
      clienteNombre: nombre,
      clienteTelefono: telefono,
      clienteEmail: email,
      sucursalId,
      notas,
      tipoEntrega,
      direccionEntrega,
      horaRetiro,
      metodoPago,
      costoEnvio,
      items: items.map((i) => ({
        productoId: i.productoId,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
      })),
    });

    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setConfirmacion({ tipoEntrega, direccionEntrega, horaRetiro, metodoPago, total });
    clear();
  }

  if (confirmacion) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50 px-6 py-12 text-center dark:bg-zinc-950">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          ¡Pedido recibido!
        </h1>
        <p className="mt-2 max-w-sm text-zinc-600 dark:text-zinc-400">
          Te vamos a contactar para confirmar el pedido.
        </p>

        <div className="mt-6 w-full max-w-sm rounded-lg border border-amber-200 bg-white p-4 text-left text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Entrega</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {confirmacion.tipoEntrega === "envio"
                ? "Envío a domicilio"
                : "Retiro en sucursal"}
            </span>
          </div>
          {confirmacion.tipoEntrega === "envio" ? (
            <div className="mt-1 flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Dirección</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {confirmacion.direccionEntrega}
              </span>
            </div>
          ) : (
            confirmacion.horaRetiro && (
              <div className="mt-1 flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Hora de retiro</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {confirmacion.horaRetiro}
                </span>
              </div>
            )
          )}
          <div className="mt-1 flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Pago</span>
            <span className="font-medium capitalize text-zinc-900 dark:text-zinc-50">
              {confirmacion.metodoPago}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
            <span>Total</span>
            <span>${confirmacion.total.toFixed(2)}</span>
          </div>

          {confirmacion.metodoPago === "mercadopago" && config && (
            <div className="mt-3 rounded-md bg-amber-50 p-3 text-xs dark:bg-amber-950">
              <p className="font-semibold text-amber-800 dark:text-amber-200">
                Transferí a:
              </p>
              {config.mercadopago_alias && <p>Alias: {config.mercadopago_alias}</p>}
              {config.mercadopago_titular && <p>Titular: {config.mercadopago_titular}</p>}
              {config.mercadopago_cbu && <p>CBU/CVU: {config.mercadopago_cbu}</p>}
            </div>
          )}
        </div>

        <Link
          href="/"
          className="mt-6 rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-zinc-950">
        <p className="text-zinc-600 dark:text-zinc-400">
          Tu carrito está vacío.
        </p>
        <Link
          href="/#productos"
          className="mt-4 rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-lg">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Finalizar pedido
        </h1>

        <ul className="mt-6 flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          {items.map((it) => (
            <li
              key={it.productoId}
              className="flex justify-between text-sm text-zinc-700 dark:text-zinc-300"
            >
              <span>
                {it.cantidad} × {it.nombre}
              </span>
              <span>${(it.precioUnitario * it.cantidad).toFixed(2)}</span>
            </li>
          ))}
          {costoEnvio > 0 && (
            <li className="flex justify-between text-sm text-zinc-700 dark:text-zinc-300">
              <span>Envío</span>
              <span>${costoEnvio.toFixed(2)}</span>
            </li>
          )}
          <li className="mt-2 flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </li>
        </ul>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <input
            required
            placeholder="Tu nombre *"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />

          <div className="mt-1 flex flex-col gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              ¿Cómo lo recibís?
            </p>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="radio"
                name="tipo_entrega"
                checked={tipoEntrega === "retiro"}
                onChange={() => setTipoEntrega("retiro")}
              />
              Retiro en sucursal
            </label>
            {tipoEntrega === "retiro" && (
              <div className="ml-6 flex flex-col gap-2">
                {sucursal?.horario_atencion && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Horario de atención: {sucursal.horario_atencion}
                  </p>
                )}
                <input
                  type="time"
                  value={horaRetiro}
                  onChange={(e) => setHoraRetiro(e.target.value)}
                  className="w-40 rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  aria-label="Hora de retiro"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="radio"
                name="tipo_entrega"
                checked={tipoEntrega === "envio"}
                onChange={() => setTipoEntrega("envio")}
              />
              Envío a domicilio
              {(sucursal?.costo_envio ?? 0) > 0 && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  (+${Number(sucursal?.costo_envio ?? 0).toFixed(2)})
                </span>
              )}
            </label>
            {tipoEntrega === "envio" && (
              <input
                required
                placeholder="Dirección de envío *"
                value={direccionEntrega}
                onChange={(e) => setDireccionEntrega(e.target.value)}
                className="ml-6 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Método de pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="mercadopago">MercadoPago</option>
            </select>
          </div>

          {metodoPago === "mercadopago" && (
            <div className="rounded-md bg-amber-50 p-3 text-xs dark:bg-amber-950">
              {config ? (
                <>
                  <p className="font-semibold text-amber-800 dark:text-amber-200">
                    Transferí a:
                  </p>
                  {config.mercadopago_alias && <p>Alias: {config.mercadopago_alias}</p>}
                  {config.mercadopago_titular && (
                    <p>Titular: {config.mercadopago_titular}</p>
                  )}
                  {config.mercadopago_cbu && <p>CBU/CVU: {config.mercadopago_cbu}</p>}
                  {!config.mercadopago_alias && !config.mercadopago_cbu && (
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Te vamos a pasar los datos para transferir cuando te
                      contactemos.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400">
                  Te vamos a pasar los datos para transferir cuando te
                  contactemos.
                </p>
              )}
            </div>
          )}

          <textarea
            placeholder="Notas (opcional)"
            rows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {pending ? "Enviando..." : `Confirmar pedido — $${total.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
