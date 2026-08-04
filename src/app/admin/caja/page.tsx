import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { CajaFiltros } from "./caja-filtros";
import { NuevoMovimientoForm } from "./nuevo-movimiento-form";
import { MovimientosList } from "./movimientos-list";
import { ReportarFaltanteForm } from "./reportar-faltante-form";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function CajaPage({
  searchParams,
}: {
  searchParams: Promise<{ sucursal?: string; fecha?: string }>;
}) {
  const { sucursal: sucursalParam, fecha: fechaParam } = await searchParams;
  const supabase = createAdminClient();

  const { data: sucursales } = await supabase
    .from("sucursales")
    .select("id, nombre")
    .order("nombre");

  const { data: categoriasPermitidas } = await supabase
    .from("categorias_config")
    .select("categoria")
    .eq("permite_reportar_faltante", true)
    .order("categoria");

  const sucursalId = sucursalParam || sucursales?.[0]?.id;
  const fecha = fechaParam || hoyISO();

  const inicio = `${fecha}T00:00:00`;
  const fin = new Date(new Date(`${fecha}T00:00:00`).getTime() + 86400000).toISOString();

  const { data: movimientos } = sucursalId
    ? await supabase
        .from("caja_movimientos")
        .select("*")
        .eq("sucursal_id", sucursalId)
        .gte("fecha", inicio)
        .lt("fecha", fin)
        .order("fecha", { ascending: false })
    : { data: [] as never[] };

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

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Caja
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Control de caja por sucursal.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/admin/caja/vender${sucursalId ? `?sucursal=${sucursalId}` : ""}`}
            className="flex items-center gap-1.5 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Vender
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <CajaFiltros sucursales={sucursales ?? []} sucursalId={sucursalId} fecha={fecha} />
      </div>

      {!sucursales?.length ? (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Primero cargá una sucursal en el módulo <b>Sucursales</b>.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <ResumenCard label="Apertura" valor={totales.apertura} />
            <ResumenCard label="Ingresos" valor={totales.ingresos} color="text-green-600 dark:text-green-400" />
            <ResumenCard label="Egresos" valor={totales.egresos} color="text-red-600 dark:text-red-400" />
            <ResumenCard label="Cierre" valor={totales.cierre} />
            <ResumenCard label="Saldo calculado" valor={saldo} destacado />
          </div>

          <div className="mt-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            <NuevoMovimientoForm sucursalId={sucursalId!} />
            <ReportarFaltanteForm
              sucursalId={sucursalId!}
              categorias={(categoriasPermitidas ?? []).map((c) => c.categoria)}
            />
          </div>

          <div className="mt-6">
            <MovimientosList movimientos={movimientos ?? []} />
          </div>
        </>
      )}
    </div>
  );
}

function ResumenCard({
  label,
  valor,
  color,
  destacado,
}: {
  label: string;
  valor: number;
  color?: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        destacado
          ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={`text-lg font-semibold ${color ?? "text-zinc-900 dark:text-zinc-50"}`}>
        ${valor.toFixed(2)}
      </p>
    </div>
  );
}
