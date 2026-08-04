import {
  IconBread,
  IconCupcake,
  IconCake,
  IconSandwich,
  IconCandy,
} from "@/components/icons";
import { IconPackage } from "@/components/admin-icons";
import { CATEGORIAS } from "@/app/admin/productos/categorias";

export const CATEGORIA_ICON: Record<string, typeof IconBread> = {
  Panes: IconBread,
  Facturas: IconCupcake,
  Tortas: IconCake,
  Sandwiches: IconSandwich,
  Dulces: IconCandy,
  Otros: IconPackage,
};

export const CATEGORIA_GRADIENTE: Record<string, string> = {
  Panes: "from-amber-700 to-amber-900",
  Facturas: "from-orange-400 to-amber-600",
  Tortas: "from-rose-400 to-pink-600",
  Sandwiches: "from-lime-600 to-green-700",
  Dulces: "from-fuchsia-500 to-purple-700",
  Otros: "from-zinc-500 to-zinc-700",
};

export function iconoDeCategoria(categoria: string) {
  return CATEGORIA_ICON[categoria] ?? IconPackage;
}

export function gradienteDeCategoria(categoria: string) {
  return CATEGORIA_GRADIENTE[categoria] ?? "from-zinc-500 to-zinc-700";
}

// Ordena categorías según el orden curado de CATEGORIAS (Panes, Facturas,
// Tortas primero); las que no están en la lista van al final, alfabéticas.
export function ordenarCategorias(categorias: string[]) {
  const orden = CATEGORIAS as readonly string[];
  return [...categorias].sort((a, b) => {
    const iA = orden.indexOf(a);
    const iB = orden.indexOf(b);
    const posA = iA === -1 ? orden.length : iA;
    const posB = iB === -1 ? orden.length : iB;
    if (posA !== posB) return posA - posB;
    return a.localeCompare(b);
  });
}
