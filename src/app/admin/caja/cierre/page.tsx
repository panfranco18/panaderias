import { createAdminClient } from "@/lib/supabase/admin";
import { CierreView } from "./cierre-view";
import { hoyISO } from "@/lib/fecha-ar";
import { calcularEstadoCaja } from "@/lib/estado-caja";
import { CONFIG_TURNO_CAJA_DEFAULT } from "@/lib/turno-caja";

export default async function CierreCajaPage({
  searchParams,
}: {
  searchParams: Promise<{ sucursal?: string; tipo?: string }>;
}) {
  const { sucursal: sucursalParam, tipo: tipoParam } = await searchParams;
  const tipo = tipoParam === "x" || tipoParam === "z" ? tipoParam : null;
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

  let desdeTarde: string | undefined;
  if (tipo === "z") {
    const { data: config } = await supabase
      .from("config_turnos_caja")
      .select("turno_tarde_inicio")
      .eq("sucursal_id", sucursalId)
      .maybeSingle();
    desdeTarde = config?.turno_tarde_inicio ?? CONFIG_TURNO_CAJA_DEFAULT.turno_tarde_inicio;
  }

  const estado = await calcularEstadoCaja(supabase, sucursalId, hoy, desdeTarde);

  return (
    <CierreView
      sucursales={sucursales ?? []}
      sucursalId={sucursalId}
      sucursalNombre={sucursal.nombre}
      generadoEn={new Date().toISOString()}
      tipo={tipo}
      formasPago={estado.formasPago}
      totalVentas={estado.totalVentas}
      totales={estado.totales}
      saldo={estado.saldo}
      gastos={estado.gastos}
      personalEnTurno={estado.personalEnTurno}
      ventasTarde={estado.ventasTarde}
    />
  );
}
