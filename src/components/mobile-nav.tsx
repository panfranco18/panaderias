"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebarContent } from "@/components/admin-sidebar-content";

function IconMenu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MobileNav(props: React.ComponentProps<typeof AdminSidebarContent>) {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  return (
    <div className="no-print lg:hidden">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Panadería
        </span>
        <button
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <IconMenu className="h-6 w-6" />
        </button>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setAbierto(false)}
          />
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl dark:bg-zinc-900">
            <button
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-3 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <IconX className="h-5 w-5" />
            </button>
            <AdminSidebarContent {...props} />
          </div>
        </div>
      )}
    </div>
  );
}
