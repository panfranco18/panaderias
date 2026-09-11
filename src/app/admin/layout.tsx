import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSidebarContent } from "@/components/admin-sidebar-content";
import { MobileNav } from "@/components/mobile-nav";
import { AvisoBanner } from "@/components/aviso-banner";
import { hoyISO, rangoDiaAR } from "@/lib/fecha-ar";
import { notificarFichaje } from "@/lib/notificaciones";

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
    const { inicio: hoyInicio, fin: hoyFin } = rangoDiaAR(hoyISO());

    const { count: registrosHoy } = await admin
      .from("registro_ingreso_personal")
      .select("id", { count: "exact", head: true })
      .eq("perfil_id", perfil.id)
      .gte("fecha", hoyInicio)
      .lt("fecha", hoyFin);

    if (!registrosHoy) {
      const { data: nuevoRegistro } = await admin
        .from("registro_ingreso_personal")
        .insert({
          perfil_id: perfil.id,
          sucursal_id: perfil.sucursal_id,
          tipo: "entrada",
        })
        .select("fecha")
        .single();

      const { data: sucursal } = await admin
        .from("sucursales")
        .select("nombre")
        .eq("id", perfil.sucursal_id)
        .maybeSingle();

      await notificarFichaje(admin, {
        tipo: "entrada",
        sucursalId: perfil.sucursal_id,
        sucursalNombre: sucursal?.nombre ?? "",
        nombreEmpleado: perfil.nombre,
        hora: nuevoRegistro?.fecha ?? new Date().toISOString(),
      });
    }

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
      query = query
        .neq("tipo", "venta_registrada")
        .neq("tipo", "fichaje")
        .neq("tipo", "cierre_x")
        .neq("tipo", "cierre_z");
      query = perfil.sucursal_id
        ? query.or(`sucursal_id.is.null,sucursal_id.eq.${perfil.sucursal_id}`)
        : query.is("sucursal_id", null);
    }

    const { data } = await query;
    notificaciones = data ?? [];
  }

  let avisos: { id: string; mensaje: string }[] = [];
  if (perfil) {
    const { data } = await admin
      .from("avisos_personal")
      .select("id, mensaje, perfil_id")
      .eq("fecha", hoyISO())
      .or(`perfil_id.is.null,perfil_id.eq.${perfil.id}`);
    avisos = data ?? [];
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
      <main className="flex-1 overflow-x-auto">
        <AvisoBanner avisos={avisos} />
        {children}
      </main>
    </div>
  );
}
