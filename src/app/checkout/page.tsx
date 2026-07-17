"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { crearPedidoOnline } from "./actions";

export default function CheckoutPage() {
  const { items, sucursalId, total, clear } = useCart();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

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

    clear();
    setOk(true);
  }

  if (ok) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50 px-6 text-center dark:bg-zinc-950">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          ¡Pedido recibido!
        </h1>
        <p className="mt-2 max-w-sm text-zinc-600 dark:text-zinc-400">
          Te vamos a contactar para coordinar el pago y el retiro.
        </p>
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
          <textarea
            placeholder="Notas (ej: horario de retiro)"
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
            {pending ? "Enviando..." : "Confirmar pedido"}
          </button>
        </form>
      </div>
    </div>
  );
}
