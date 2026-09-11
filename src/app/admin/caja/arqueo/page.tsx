import { createAdminClient } from "@/lib/supabase/admin";
import { ArqueoView } from "./arqueo-view";
import { hoyISO, rangoDiaAR } from "@/lib/fecha-ar";

const ETIQUETA_VENTA_TIPO: Record<string, string> = {
  venta_1: "Venta 1",
  venta_deleite: "Venta Deleite",
  sin_clasificar: "Sin clasificar",
};

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
  const { inicio, fin } = rangoDiaAR(hoy);

  const [{ data: ventas }, { data: movimientos }, cierreXResultado] = await Promise.all([
    supabase
      .from("ventas")
      .select("id, total, metodo_pago, venta_tipo")
      .eq("sucursal_id", sucursalId)
      .gte("fecha", inicio)
      .lt("fecha", fin),
    supabase
      .from("caja_movimientos")
      .select("tipo, monto")
      .eq("sucursal_id", sucursalId)
      .gte("fecha", inicio)
      .lt("fecha", fin),
    obtenerCierreXDeHoy(supabase, sucursalId, hoy),
  ]);

  const gastos = (movimientos ?? [])
    .filter((m) => m.tipo === "egreso")
    .reduce((a, m) => a + Number(m.monto), 0);
  const depositos = (movimientos ?? [])
    .filter((m) => m.tipo === "deposito")
    .reduce((a, m) => a + Number(m.monto), 0);

  const grupos = new Map<string, { formasPago: Map<string, number>; total: number }>();
  for (const clave of ["venta_1", "venta_deleite", "sin_clasificar"]) {
    grupos.set(clave, { formasPago: new Map(), total: 0 });
  }

  for (const v of ventas ?? []) {
    const clave = v.venta_tipo ?? "sin_clasificar";
    const grupo = grupos.get(clave) ?? { formasPago: new Map(), total: 0 };
    const metodo = v.metodo_pago ?? "sin_especificar";
    grupo.formasPago.set(metodo, (grupo.formasPago.get(metodo) ?? 0) + Number(v.total));
    grupo.total += Number(v.total);
    grupos.set(clave, grupo);
  }

  const secciones = Array.from(grupos.entries())
    .filter(([clave, grupo]) => clave !== "sin_clasificar" || grupo.total > 0)
    .map(([clave, grupo]) => {
      const formasPago = Array.from(grupo.formasPago.entries())
        .map(([metodo, monto]) => ({ metodo: metodo === "sin_especificar" ? null : metodo, monto }))
        .sort((a, b) => b.monto - a.monto);

      if (clave === "venta_1") {
        return {
          clave,
          etiqueta: ETIQUETA_VENTA_TIPO[clave],
          formasPago,
          extras: [
            { etiqueta: "Gastos (identificados)", monto: gastos, signo: "-" as const },
            { etiqueta: "Depósitos", monto: depositos, signo: "-" as const },
          ],
          total: grupo.total - gastos - depositos,
        };
      }

      if (clave === "venta_deleite") {
        return {
          clave,
          etiqueta: ETIQUETA_VENTA_TIPO[clave],
          formasPago,
          extras: cierreXResultado
            ? [
                {
                  etiqueta: "Cierre X de hoy (referencia, no suma al total)",
                  monto: cierreXResultado.total,
                  signo: null,
                },
              ]
            : [],
          total: grupo.total,
        };
      }

      return {
        clave,
        etiqueta: ETIQUETA_VENTA_TIPO[clave] ?? clave,
        formasPago,
        extras: [],
        total: grupo.total,
      };
    });

  const totalGeneral = secciones.reduce((a, s) => a + s.total, 0);

  return (
    <ArqueoView
      sucursales={sucursales ?? []}
      sucursalId={sucursalId}
      sucursalNombre={sucursal.nombre}
      generadoEn={new Date().toISOString()}
      secciones={secciones}
      totalGeneral={totalGeneral}
    />
  );
}

// cierres_turno.total_ventas puede no existir todavía si no se corrió
// supabase/019_arqueo_total_cierre_x.sql — en ese caso no mostramos la
// referencia de Cierre X, sin romper el resto del Arqueo.
async function obtenerCierreXDeHoy(
  supabase: ReturnType<typeof createAdminClient>,
  sucursalId: string,
  hoy: string
) {
  const { data, error } = await supabase
    .from("cierres_turno")
    .select("total_ventas")
    .eq("sucursal_id", sucursalId)
    .eq("tipo", "x")
    .eq("fecha", hoy)
    .not("total_ventas", "is", null)
    .order("hora", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return { total: Number(data.total_ventas) };
}
