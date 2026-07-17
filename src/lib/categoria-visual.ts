import {
  IconBread,
  IconCupcake,
  IconCake,
  IconSandwich,
  IconCandy,
} from "@/components/icons";
import { IconPackage } from "@/components/admin-icons";

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
