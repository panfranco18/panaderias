"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULOS_NAV as items } from "@/lib/admin-modulos";

export function AdminNav({
  rol,
  nivelAcceso,
}: {
  rol: string;
  nivelAcceso: Record<string, boolean>;
}) {
  const pathname = usePathname();
  const esSuperadmin = rol === "superadmin";

  const visibles = items.filter(
    (item) => item.modulo === null || esSuperadmin || nivelAcceso[item.modulo]
  );

  return (
    <nav className="flex flex-col gap-1 p-3">
      {visibles.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
