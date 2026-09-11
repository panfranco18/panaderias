import { createAdminClient } from "@/lib/supabase/admin";
import { CierreView } from "./cierre-view";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function CierreCajaPage({
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

  const hoy = hoyISO();
  const inicio = `${hoy}T00:00:00`;
  const fin = new Date(new Date(inicio).getTime() + 86400000).toISOString();
  const ahora = new Date();

  if (!sucursalId || !sucursal) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Primero cargá una sucursal en el módulo <b>Sucursales</b>.
        </p>
      </div>
    );
  }

  const [{ data: ventas }, { data: movimientos }, { data: personal }, { data: registros }] =
    await Promise.all([
      supabase
        .from("ventas")
        .select("id, total, metodo_pago")
        .eq("sucursal_id", sucursalId)
        .gte("fecha", inicio)
        .lt("fecha", fin),
      supabase
        .from("caja_movimientos")
        .select("tipo, monto, descripcion, fecha")
        .eq("sucursal_id", sucursalId)
        .gte("fecha", inicio)
        .lt("fecha", fin)
        .order("fecha", { ascending: true }),
      supabase
        .from("perfiles")
        .select("id, nombre")
        .eq("sucursal_id", sucursalId),
      supabase
        .from("registro_ingreso_personal")
        .select("perfil_id, tipo, fecha")
        .eq("sucursal_id", sucursalId)
        .gte("fecha", inicio)
        .lt("fecha", fin)
        .order("fecha", { ascending: true }),
    ]);

  const formasPagoMap = new Map<string, number>();
  for (const v of ventas ?? []) {
    const key = v.metodo_pago ?? "sin_especificar";
    formasPagoMap.set(key, (formasPagoMap.get(key) ?? 0) + Number(v.total));
  }
  const formasPago = Array.from(formasPagoMap.entries())
    .map(([metodo, monto]) => ({
      metodo: metodo === "sin_especificar" ? null : metodo,
      monto,
    }))
    .sort((a, b) => b.monto - a.monto);
  const totalVentas = (ventas ?? []).reduce((a, v) => a + Number(v.total), 0);

  const totales = (movimientos ?? []).reduce(
    (acc, m) => {
      const monto = Number(m.monto);
      if (m.tipo === "apertura") acc.apertura += monto;
      if (m.tipo === "ingreso") acc.ingresos += monto;
      if (m.tipo === "egreso") acc.egresos += monto;
      if (m.tipo === "cierre") acc.cierre += monto;
      return acc;
    },
    { apertura: 0, ingresos: 0, egresos: 0, cierre: 0 }
  );
  const saldo = totales.apertura + totales.ingresos - totales.egresos;

  const gastos = (movimientos ?? []).filter((m) => m.tipo === "egreso");

  const ultimoTipoPorPerfil = new Map<string, string>();
  const horaEntradaPorPerfil = new Map<string, string>();
  for (const r of registros ?? []) {
    ultimoTipoPorPerfil.set(r.perfil_id, r.tipo);
    if (r.tipo === "entrada") horaEntradaPorPerfil.set(r.perfil_id, r.fecha);
    else horaEntradaPorPerfil.delete(r.perfil_id);
  }
  const personalEnTurno = (personal ?? [])
    .filter((p) => ultimoTipoPorPerfil.get(p.id) === "entrada")
    .map((p) => ({ nombre: p.nombre, hora: horaEntradaPorPerfil.get(p.id) ?? null }));

  return (
    <CierreView
      sucursales={sucursales ?? []}
      sucursalId={sucursalId}
      sucursalNombre={sucursal.nombre}
      generadoEn={ahora.toISOString()}
      formasPago={formasPago}
      totalVentas={totalVentas}
      totales={totales}
      saldo={saldo}
      gastos={gastos}
      personalEnTurno={personalEnTurno}
    />
  );
}
