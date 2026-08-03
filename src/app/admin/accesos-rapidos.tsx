import Link from "next/link";
import { MODULOS_NAV, BOTON_GRADIENTE } from "@/lib/admin-modulos";

export function AccesosRapidos({
  esSuperadmin,
  nivelAcceso,
}: {
  esSuperadmin: boolean;
  nivelAcceso: Record<string, boolean>;
}) {
  const accesibles = MODULOS_NAV.filter(
    (m) => m.modulo !== null && (esSuperadmin || nivelAcceso[m.modulo])
  );

  if (accesibles.length === 0) return null;

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {accesibles.map(({ href, label, icon: Icon, modulo }) => (
        <Link
          key={href}
          href={href}
          className={`group flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${BOTON_GRADIENTE[modulo as string] ?? "from-zinc-500 to-zinc-700"} p-4 text-center text-white shadow-md transition-transform hover:scale-105 hover:shadow-xl`}
        >
          <Icon className="h-8 w-8 drop-shadow-sm" />
          <span className="text-sm font-bold">{label}</span>
        </Link>
      ))}
    </div>
  );
}
