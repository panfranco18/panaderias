import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { rangoDiaAR } from "@/lib/fecha-ar";

type Supabase = ReturnType<typeof createAdminClient>;

export type FormaPago = { metodo: string | null; monto: number };
export type Gasto = { tipo: string; monto: number; descripcion: string | null; fecha: string };
export type PersonalTurno = { nombre: string; hora: string | null };

export type EstadoCaja = {
  formasPago: FormaPago[];
  totalVentas: number;
  totales: { apertura: number; ingresos: number; egresos: number; cierre: number };
  saldo: number;
  gastos: Gasto[];
  personalEnTurno: PersonalTurno[];
  ventasTarde?: { formasPago: FormaPago[]; total: number };
};

// Estado de la caja de una sucursal desde el inicio del día (hora
// argentina) hasta este momento. `desdeTarde` es opcional: si se pasa,
// además calcula el sub-total de ventas desde esa hora (para el Cierre Z,
// que además del total del día muestra "lo que se hizo a la tarde").
export async function calcularEstadoCaja(
  supabase: Supabase,
  sucursalId: string,
  fecha: string,
  desdeTarde?: string
): Promise<EstadoCaja> {
  const { inicio, fin } = rangoDiaAR(fecha);

  const [{ data: ventas }, { data: movimientos }, { data: personal }, { data: registros }] =
    await Promise.all([
      supabase
        .from("ventas")
        .select("id, total, metodo_pago, fecha")
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
      supabase.from("perfiles").select("id, nombre").eq("sucursal_id", sucursalId),
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
    .map(([metodo, monto]) => ({ metodo: metodo === "sin_especificar" ? null : metodo, monto }))
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

  let ventasTarde: EstadoCaja["ventasTarde"];
  if (desdeTarde) {
    const inicioTardeMs = new Date(`${fecha}T${desdeTarde}-03:00`).getTime();
    const ventasDeLaTarde = (ventas ?? []).filter(
      (v) => new Date(v.fecha).getTime() >= inicioTardeMs
    );
    const map = new Map<string, number>();
    for (const v of ventasDeLaTarde) {
      const key = v.metodo_pago ?? "sin_especificar";
      map.set(key, (map.get(key) ?? 0) + Number(v.total));
    }
    ventasTarde = {
      formasPago: Array.from(map.entries())
        .map(([metodo, monto]) => ({ metodo: metodo === "sin_especificar" ? null : metodo, monto }))
        .sort((a, b) => b.monto - a.monto),
      total: ventasDeLaTarde.reduce((a, v) => a + Number(v.total), 0),
    };
  }

  return { formasPago, totalVentas, totales, saldo, gastos, personalEnTurno, ventasTarde };
}
