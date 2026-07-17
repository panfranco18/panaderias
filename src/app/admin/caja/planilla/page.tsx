import { createAdminClient } from "@/lib/supabase/admin";
import { PlanillaUploader } from "./planilla-uploader";

export default async function PlanillaPage({
  searchParams,
}: {
  searchParams: Promise<{ sucursal?: string }>;
}) {
  const { sucursal: sucursalParam } = await searchParams;
  const supabase = createAdminClient();

  const [{ data: sucursales }, { data: productos }] = await Promise.all([
    supabase.from("sucursales").select("id, nombre").order("nombre"),
    supabase
      .from("productos")
      .select("id, nombre, precio_base")
      .eq("activo", true)
      .order("nombre"),
  ]);

  const sucursalId = sucursalParam || sucursales?.[0]?.id;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Cargar planilla escaneada
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Sacale una foto a la planilla de ventas del día y el sistema arma la
        venta automáticamente. Revisá los datos antes de confirmar.
      </p>

      {!sucursales?.length ? (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Primero cargá una sucursal en el módulo <b>Sucursales</b>.
        </p>
      ) : !productos?.length ? (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Primero cargá productos en el módulo <b>Productos</b>.
        </p>
      ) : (
        <PlanillaUploader
          sucursales={sucursales}
          sucursalIdInicial={sucursalId!}
          productos={productos}
        />
      )}
    </div>
  );
}
