import { AdminNav } from "@/components/admin-nav";
import { LogoutButton } from "@/components/logout-button";
import { FichajeWidget } from "@/components/fichaje-widget";
import { NotificacionesWidget } from "@/components/notificaciones-widget";
import { InstallAppButton } from "@/components/install-app-button";

type Notificacion = { id: string; tipo: string; mensaje: string; created_at: string };

export function AdminSidebarContent({
  nombre,
  rol,
  nivelAcceso,
  tieneSucursal,
  estadoFichaje,
  notificaciones,
}: {
  nombre: string;
  rol: string;
  nivelAcceso: Record<string, boolean>;
  tieneSucursal: boolean;
  estadoFichaje: "entrada" | "salida" | null;
  notificaciones: Notificacion[];
}) {
  return (
    <>
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Panadería
        </span>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{nombre}</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AdminNav rol={rol} nivelAcceso={nivelAcceso} />
      </div>
      {tieneSucursal && (
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <FichajeWidget estadoInicial={estadoFichaje} />
        </div>
      )}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <NotificacionesWidget notificaciones={notificaciones} />
      </div>
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <InstallAppButton />
      </div>
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <LogoutButton />
      </div>
    </>
  );
}
