import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminNav } from "@/components/admin-nav";
import { LogoutButton } from "@/components/logout-button";
import { FichajeWidget } from "@/components/fichaje-widget";
import { NotificacionesWidget } from "@/components/notificaciones-widget";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  const { data: perfil } = user
    ? await admin
        .from("perfiles")
        .select("id, nombre, rol, nivel_acceso, sucursal_id")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const rol = perfil?.rol ?? "empleado";
  const nivelAcceso = (perfil?.nivel_acceso as Record<string, boolean>) ?? {};

  let estadoFichaje: "entrada" | "salida" | null = null;
  if (perfil?.sucursal_id) {
    const { data: ultimoRegistro } = await admin
      .from("registro_ingreso_personal")
      .select("tipo")
      .eq("perfil_id", perfil.id)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle();
    estadoFichaje = (ultimoRegistro?.tipo as "entrada" | "salida" | undefined) ?? null;
  }

  let notificaciones: { id: string; tipo: string; mensaje: string; created_at: string }[] = [];
  if (perfil) {
    let query = admin
      .from("notificaciones")
      .select("id, tipo, mensaje, created_at")
      .eq("leida", false)
      .order("created_at", { ascending: false })
      .limit(30);

    if (rol !== "superadmin") {
      query = perfil.sucursal_id
        ? query.or(`sucursal_id.is.null,sucursal_id.eq.${perfil.sucursal_id}`)
        : query.is("sucursal_id", null);
    }

    const { data } = await query;
    notificaciones = data ?? [];
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="no-print flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Panadería
          </span>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {perfil?.nombre ?? "Panel admin"}
          </p>
        </div>
        <div className="flex-1">
          <AdminNav rol={rol} nivelAcceso={nivelAcceso} />
        </div>
        {perfil?.sucursal_id && (
          <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
            <FichajeWidget estadoInicial={estadoFichaje} />
          </div>
        )}
        {perfil && (
          <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
            <NotificacionesWidget notificaciones={notificaciones} />
          </div>
        )}
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto">{children}</main>
    </div>
  );
}
