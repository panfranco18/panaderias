import { createAdminClient } from "@/lib/supabase/admin";
import { HistorialView } from "./historial-view";
import { hoyISO } from "@/lib/fecha-ar";
import { calcularEstadoCajaRango } from "@/lib/estado-caja";

export default async function HistorialCajaPage({
  searchParams,
}: {
  searchParams: Promise<{ sucursal?: string; desde?: string; hasta?: string }>;
}) {
  const { sucursal: sucursalParam, desde: desdeParam, hasta: hastaParam } = await searchParams;
  const supabase = createAdminClient();

  const { data: sucursales } = await supabase
    .from("sucursales")
    .select("id, nombre")
    .order("nombre");

  const sucursalId = sucursalParam || sucursales?.[0]?.id;
  const sucursal = sucursales?.find((s) => s.id === sucursalId);

  const hoy = hoyISO();
  const desde = desdeParam || hoy;
  const hasta = hastaParam || hoy;

  if (!sucursalId || !sucursal) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Primero cargá una sucursal en el módulo <b>Sucursales</b>.
        </p>
      </div>
    );
  }

  const estado = await calcularEstadoCajaRango(supabase, sucursalId, desde, hasta);

  const [{ data: arqueosGuardados, error: arqueosError }, { data: cierres, error: cierresError }] =
    await Promise.all([
      supabase
        .from("arqueos_caja")
        .select("*")
        .eq("sucursal_id", sucursalId)
        .gte("fecha", desde)
        .lte("fecha", hasta)
        .order("created_at", { ascending: false }),
      supabase
        .from("cierres_turno")
        .select("*")
        .eq("sucursal_id", sucursalId)
        .gte("fecha", desde)
        .lte("fecha", hasta)
        .order("fecha", { ascending: false })
        .order("hora", { ascending: false }),
    ]);

  const perfilIds = [
    ...new Set(
      [...(arqueosGuardados ?? []), ...(cierres ?? [])]
        .map((r) => r.perfil_id)
        .filter((id): id is string => !!id)
    ),
  ];
  const { data: perfiles } = perfilIds.length
    ? await supabase.from("perfiles").select("id, nombre").in("id", perfilIds)
    : { data: [] as { id: string; nombre: string }[] };
  const nombrePorPerfilId = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));

  return (
    <HistorialView
      sucursales={sucursales ?? []}
      sucursalId={sucursalId}
      sucursalNombre={sucursal.nombre}
      desde={desde}
      hasta={hasta}
      generadoEn={new Date().toISOString()}
      estado={estado}
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
      cierres={
        cierresError
          ? []
          : (cierres ?? []).map((c) => ({
              id: c.id,
              fecha: c.fecha,
              hora: c.hora,
              tipo: c.tipo,
              nombreEmpleado: (c.perfil_id && nombrePorPerfilId.get(c.perfil_id)) || "Alguien",
              totalVentas: c.total_ventas != null ? Number(c.total_ventas) : null,
            }))
      }
    />
  );
}
