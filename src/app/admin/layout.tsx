import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSidebarContent } from "@/components/admin-sidebar-content";
import { MobileNav } from "@/components/mobile-nav";

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
      query = query.neq("tipo", "venta_registrada");
      query = perfil.sucursal_id
        ? query.or(`sucursal_id.is.null,sucursal_id.eq.${perfil.sucursal_id}`)
        : query.is("sucursal_id", null);
    }

    const { data } = await query;
    notificaciones = data ?? [];
  }

  const sidebarProps = {
    nombre: perfil?.nombre ?? "Panel admin",
    rol,
    nivelAcceso,
    tieneSucursal: !!perfil?.sucursal_id,
    estadoFichaje,
    notificaciones,
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 lg:flex-row dark:bg-zinc-950">
      <MobileNav {...sidebarProps} />
      <aside className="no-print hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex dark:border-zinc-800 dark:bg-zinc-900">
        <AdminSidebarContent {...sidebarProps} />
      </aside>
      <main className="flex-1 overflow-x-auto">{children}</main>
    </div>
  );
}
