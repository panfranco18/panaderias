"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productoId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  unidadMedida?: string;
  categoria?: string;
};

type CartContextValue = {
  items: CartItem[];
  sucursalId: string | null;
  setSucursalId: (id: string) => void;
  addItem: (item: Omit<CartItem, "cantidad">, cantidad?: number) => void;
  updateCantidad: (productoId: string, cantidad: number) => void;
  removeItem: (productoId: string) => void;
  clear: () => void;
  total: number;
  cantidadTotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "panaderiap_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sucursalId, setSucursalIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.items?.length) setItems(parsed.items);
        if (parsed.sucursalId) setSucursalIdState(parsed.sucursalId);
      } catch {
        // localStorage corrupto, se ignora y arranca vacío
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, sucursalId }));
  }, [items, sucursalId, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "cantidad">, cantidad = 1) => {
      setItems((prev) => {
        const existente = prev.find((i) => i.productoId === item.productoId);
        if (existente) {
          return prev.map((i) =>
            i.productoId === item.productoId
              ? { ...i, cantidad: i.cantidad + cantidad }
              : i
          );
        }
        return [...prev, { ...item, cantidad }];
      });
    },
    []
  );

  const updateCantidad = useCallback((productoId: string, cantidad: number) => {
    setItems((prev) =>
      cantidad <= 0
        ? prev.filter((i) => i.productoId !== productoId)
        : prev.map((i) =>
            i.productoId === productoId ? { ...i, cantidad } : i
          )
    );
  }, []);

  const removeItem = useCallback((productoId: string) => {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0),
    [items]
  );
  const cantidadTotal = useMemo(
    () => items.reduce((acc, i) => acc + i.cantidad, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        sucursalId,
        setSucursalId: setSucursalIdState,
        addItem,
        updateCantidad,
        removeItem,
        clear,
        total,
        cantidadTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
