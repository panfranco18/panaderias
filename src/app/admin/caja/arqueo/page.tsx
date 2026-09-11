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

  const { data: ventas } = await supabase
    .from("ventas")
    .select("id, total, metodo_pago, venta_tipo")
    .eq("sucursal_id", sucursalId)
    .gte("fecha", inicio)
    .lt("fecha", fin);

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
    .map(([clave, grupo]) => ({
      clave,
      etiqueta: ETIQUETA_VENTA_TIPO[clave] ?? clave,
      formasPago: Array.from(grupo.formasPago.entries())
        .map(([metodo, monto]) => ({ metodo: metodo === "sin_especificar" ? null : metodo, monto }))
        .sort((a, b) => b.monto - a.monto),
      total: grupo.total,
    }));

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
