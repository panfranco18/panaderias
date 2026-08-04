import { createAdminClient } from "@/lib/supabase/admin";
import { getPerfilActual } from "@/lib/auth/current-perfil";
import { NotificacionesList } from "./notificaciones-list";

export default async function NotificacionesPage() {
  const perfil = await getPerfilActual();
  const supabase = createAdminClient();

  let query = supabase
    .from("notificaciones")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (perfil && perfil.rol !== "superadmin") {
    query = query.neq("tipo", "venta_registrada");
    query = perfil.sucursalId
      ? query.or(`sucursal_id.is.null,sucursal_id.eq.${perfil.sucursalId}`)
      : query.is("sucursal_id", null);
  }

  const { data: notificaciones, error } = await query;

  const { data: sucursales } = await supabase
    .from("sucursales")
    .select("id, nombre");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Notificaciones
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Avisos de stock bajo y cambios de precio de venta.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6 max-w-2xl">
        <NotificacionesList
          notificaciones={notificaciones ?? []}
          sucursales={sucursales ?? []}
        />
      </div>
    </div>
  );
}
