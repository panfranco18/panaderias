import { createAdminClient } from "@/lib/supabase/admin";
import { getPerfilActual } from "@/lib/auth/current-perfil";
import { AccesosRapidos } from "./accesos-rapidos";
import { DeclararStockForm } from "./declarar-stock-form";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AdminHome() {
  const perfil = await getPerfilActual();
  const supabase = createAdminClient();

  const { data: perfilConAcceso } = perfil
    ? await supabase
        .from("perfiles")
        .select("nivel_acceso")
        .eq("id", perfil.id)
        .maybeSingle()
    : { data: null };
  const nivelAcceso = (perfilConAcceso?.nivel_acceso as Record<string, boolean>) ?? {};

  const hoy = hoyISO();
  const inicio = `${hoy}T00:00:00`;
  const fin = new Date(new Date(inicio).getTime() + 86400000).toISOString();

  const { data: sucursalesTodas } = await supabase
    .from("sucursales")
    .select("id, nombre")
    .order("nombre");

  const sucursales =
    perfil?.rol === "superadmin"
      ? (sucursalesTodas ?? [])
      : (sucursalesTodas ?? []).filter((s) => s.id === perfil?.sucursalId);

  const sucursalIds = sucursales.map((s) => s.id);

  const [
    { data: ventas },
    { data: caja },
    { data: pedidosPendientes },
    { data: personal },
    { data: registros },
    { data: categoriasTrack },
    { data: declarado },
  ] =
    await Promise.all([
      sucursalIds.length
        ? supabase
            .from("ventas")
            .select("id, sucursal_id, total")
            .in("sucursal_id", sucursalIds)
            .gte("fecha", inicio)
            .lt("fecha", fin)
        : Promise.resolve({
            data: [] as { id: string; sucursal_id: string; total: number }[],
          }),
      sucursalIds.length
        ? supabase
            .from("caja_movimientos")
            .select("sucursal_id, tipo, monto")
            .in("sucursal_id", sucursalIds)
            .gte("fecha", inicio)
            .lt("fecha", fin)
        : Promise.resolve({
            data: [] as { sucursal_id: string; tipo: string; monto: number }[],
          }),
      sucursalIds.length
        ? supabase
            .from("pedidos")
            .select("sucursal_id, estado")
            .in("sucursal_id", sucursalIds)
            .eq("estado", "pendiente")
        : Promise.resolve({ data: [] as { sucursal_id: string; estado: string }[] }),
      sucursalIds.length
        ? supabase
            .from("perfiles")
            .select("id, nombre, sucursal_id")
            .in("sucursal_id", sucursalIds)
        : Promise.resolve({ data: [] as { id: string; nombre: string; sucursal_id: string }[] }),
      sucursalIds.length
        ? supabase
            .from("registro_ingreso_personal")
            .select("perfil_id, tipo, fecha")
            .in("sucursal_id", sucursalIds)
            .gte("fecha", inicio)
            .lt("fecha", fin)
            .order("fecha", { ascending: true })
        : Promise.resolve({ data: [] as { perfil_id: string; tipo: string; fecha: string }[] }),
      supabase
        .from("categorias_config")
        .select("categoria")
        .eq("requiere_declaracion_diaria", true),
      sucursalIds.length
        ? supabase
            .from("stock_diario_categoria")
            .select("sucursal_id, categoria, cantidad_inicial")
            .in("sucursal_id", sucursalIds)
            .eq("fecha", hoy)
        : Promise.resolve({
            data: [] as { sucursal_id: string; categoria: string; cantidad_inicial: number }[],
          }),
    ]);

  const categoriasTrackeadas = (categoriasTrack ?? []).map((c) => c.categoria);

  const productosTrackeados = categoriasTrackeadas.length
    ? (
        await supabase
          .from("productos")
          .select("id, categoria")
          .in("categoria", categoriasTrackeadas)
      ).data ?? []
    : [];
  const categoriaPorProducto = new Map(
    productosTrackeados.map((p) => [p.id, p.categoria])
  );
  const productoIdsTrackeados = productosTrackeados.map((p) => p.id);

  const ventaIdsHoy = (ventas ?? []).map((v) => v.id);
  const itemsTrackeados =
    ventaIdsHoy.length && productoIdsTrackeados.length
      ? (
          await supabase
            .from("items_venta")
            .select("venta_id, producto_id, cantidad")
            .in("venta_id", ventaIdsHoy)
            .in("producto_id", productoIdsTrackeados)
        ).data ?? []
      : [];

  const sucursalPorVenta = new Map((ventas ?? []).map((v) => [v.id, v.sucursal_id]));

  const vendidoHoyPorSucursal = new Map<string, Map<string, number>>();
  for (const it of itemsTrackeados) {
    const sucId = sucursalPorVenta.get(it.venta_id);
    const cat = it.producto_id ? categoriaPorProducto.get(it.producto_id) : null;
    if (!sucId || !cat) continue;
    const mapa = vendidoHoyPorSucursal.get(sucId) ?? new Map<string, number>();
    mapa.set(cat, (mapa.get(cat) ?? 0) + Number(it.cantidad));
    vendidoHoyPorSucursal.set(sucId, mapa);
  }

  const ultimoTipoPorPerfil = new Map<string, string>();
  const horaEntradaPorPerfil = new Map<string, string>();
  for (const r of registros ?? []) {
    ultimoTipoPorPerfil.set(r.perfil_id, r.tipo);
    if (r.tipo === "entrada") horaEntradaPorPerfil.set(r.perfil_id, r.fecha);
    else horaEntradaPorPerfil.delete(r.perfil_id);
  }
  const presentes = (personal ?? []).filter(
    (p) => ultimoTipoPorPerfil.get(p.id) === "entrada"
  );

  const resumen = sucursales.map((s) => {
    const ventasSucursal = (ventas ?? []).filter((v) => v.sucursal_id === s.id);
    const totalVentas = ventasSucursal.reduce((a, v) => a + Number(v.total), 0);

    const cajaSucursal = (caja ?? []).filter((c) => c.sucursal_id === s.id);
    const saldo = cajaSucursal.reduce((a, c) => {
      const monto = Number(c.monto);
      if (c.tipo === "apertura" || c.tipo === "ingreso") return a + monto;
      if (c.tipo === "egreso") return a - monto;
      return a;
    }, 0);

    const pendientes = (pedidosPendientes ?? []).filter(
      (p) => p.sucursal_id === s.id
    ).length;

    const presentesSucursal = presentes.filter((p) => p.sucursal_id === s.id);

    const declaradoSucursal = (declarado ?? []).filter((d) => d.sucursal_id === s.id);
    const vendidoSucursal = vendidoHoyPorSucursal.get(s.id);
    const stockHoy = categoriasTrackeadas.map((categoria) => {
      const fila = declaradoSucursal.find((d) => d.categoria === categoria);
      const cantidadInicial = fila ? Number(fila.cantidad_inicial) : null;
      const vendido = vendidoSucursal?.get(categoria) ?? 0;
      const restante = cantidadInicial !== null ? cantidadInicial - vendido : null;
      return { categoria, cantidadInicial, restante };
    });

    const puedeDeclarar =
      perfil?.rol === "superadmin" ||
      (perfil?.rol === "encargado_sucursal" && perfil.sucursalId === s.id);

    return {
      sucursal: s,
      totalVentas,
      saldo,
      pendientes,
      presentesSucursal,
      stockHoy,
      puedeDeclarar,
    };
  });

  const totalGeneral = resumen.reduce((a, r) => a + r.totalVentas, 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Panel admin
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Control en vivo — {new Date().toLocaleDateString("es-AR")}
      </p>

      <div className="mt-6">
        <AccesosRapidos
          esSuperadmin={perfil?.rol === "superadmin"}
          nivelAcceso={nivelAcceso}
        />
      </div>

      {sucursales.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Todavía no hay sucursales cargadas. Usá el menú de la izquierda para
          empezar.
        </p>
      ) : (
        <>
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Total vendido hoy (todas las sucursales)
            </p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              ${totalGeneral.toFixed(2)}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumen.map(({ sucursal, totalVentas, saldo, pendientes, presentesSucursal, stockHoy, puedeDeclarar }) => (
              <div
                key={sucursal.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {sucursal.nombre}
                </p>
                <dl className="mt-3 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      Ventas hoy
                    </dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                      ${totalVentas.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      Saldo de caja
                    </dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                      ${saldo.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      Pedidos pendientes
                    </dt>
                    <dd
                      className={`font-medium ${pendientes > 0 ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-zinc-50"}`}
                    >
                      {pendientes}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Personal presente ({presentesSucursal.length})
                  </p>
                  {presentesSucursal.length === 0 ? (
                    <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
                      Nadie fichado ahora
                    </p>
                  ) : (
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {presentesSucursal.map((p) => {
                        const hora = horaEntradaPorPerfil.get(p.id);
                        return (
                          <li
                            key={p.id}
                            className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300"
                          >
                            {p.nombre}
                            {hora && (
                              <span className="ml-1 font-normal text-green-700 dark:text-green-400">
                                · {new Date(hora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {stockHoy.length > 0 && (
                  <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Stock de hoy
                    </p>
                    {puedeDeclarar ? (
                      <div className="mt-2">
                        <DeclararStockForm
                          sucursalId={sucursal.id}
                          categorias={stockHoy.map((c) => ({
                            categoria: c.categoria,
                            cantidadInicial: c.cantidadInicial,
                          }))}
                        />
                      </div>
                    ) : (
                      <ul className="mt-1 flex flex-col gap-1 text-sm">
                        {stockHoy.map((c) => (
                          <li key={c.categoria} className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">
                              {c.categoria}
                            </span>
                            <span
                              className={
                                c.restante === null
                                  ? "text-zinc-400 dark:text-zinc-500"
                                  : "font-medium text-zinc-900 dark:text-zinc-50"
                              }
                            >
                              {c.restante === null ? "Sin declarar" : c.restante}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {puedeDeclarar && (
                      <ul className="mt-2 flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {stockHoy
                          .filter((c) => c.restante !== null)
                          .map((c) => (
                            <li key={c.categoria} className="flex justify-between">
                              <span>Restante {c.categoria}</span>
                              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                {c.restante}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
