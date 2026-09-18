import { createAdminClient } from "@/lib/supabase/admin";
import { ArqueoView } from "./arqueo-view";
import { hoyISO } from "@/lib/fecha-ar";
import { calcularArqueo } from "@/lib/arqueo-caja";

export default async function ArqueoCajaPage({
  searchParams,
}: {
  searchParams: Promise<{ sucursal?: string }>;
}) {
  const { sucursal: sucursalParam } = await searchParams;
  const supabase = createAdminClient();

  const { data: sucursales } = await supabase
    .from("sucursales")
    .select("id, nombre")
    .order("nombre");

  const sucursalId = sucursalParam || sucursales?.[0]?.id;
  const sucursal = sucursales?.find((s) => s.id === sucursalId);

  if (!sucursalId || !sucursal) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Primero cargá una sucursal en el módulo <b>Sucursales</b>.
        </p>
      </div>
    );
  }

  const hoy = hoyISO();

  const [{ secciones, totalGeneral, comparacion }, { data: arqueosGuardados, error: arqueosError }] =
    await Promise.all([
      calcularArqueo(supabase, sucursalId, hoy),
      supabase
        .from("arqueos_caja")
        .select("*")
        .eq("sucursal_id", sucursalId)
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

  const perfilIds = [...new Set((arqueosGuardados ?? []).map((a) => a.perfil_id).filter((id): id is string => !!id))];
  const { data: perfilesArqueos } = perfilIds.length
    ? await supabase.from("perfiles").select("id, nombre").in("id", perfilIds)
    : { data: [] as { id: string; nombre: string }[] };
  const nombrePorPerfilId = new Map((perfilesArqueos ?? []).map((p) => [p.id, p.nombre]));

  return (
    <ArqueoView
      sucursales={sucursales ?? []}
      sucursalId={sucursalId}
      sucursalNombre={sucursal.nombre}
      generadoEn={new Date().toISOString()}
      secciones={secciones}
      totalGeneral={totalGeneral}
      comparacion={comparacion}
      arqueosGuardados={
        arqueosError
          ? []
          : (arqueosGuardados ?? []).map((a) => ({
              id: a.id,
              fecha: a.fecha,
              creadoEn: a.created_at,
              nombreEmpleado: (a.perfil_id && nombrePorPerfilId.get(a.perfil_id)) || "Alguien",
              totalVentas: Number(a.total_ventas),
              totalValores: Number(a.total_valores),
              diferencia: Number(a.diferencia),
              observaciones: a.observaciones,
            }))
      }
      migracionPendiente={!!arqueosError}
    />
  );
}
