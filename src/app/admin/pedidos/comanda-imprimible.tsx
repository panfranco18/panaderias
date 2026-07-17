type Item = {
  id: string;
  producto_id: string | null;
  cantidad: number;
};

type Pedido = {
  cliente_nombre: string;
  cliente_telefono: string | null;
  tipo: string;
  notas: string | null;
  fecha_evento: string | null;
};

export function ComandaImprimible({
  comanda,
  productos,
  sucursalNombre,
}: {
  comanda: { pedido: Pedido; items: Item[] } | null;
  productos: { id: string; nombre: string }[];
  sucursalNombre: string;
}) {
  if (!comanda) return null;

  const nombreProducto = (id: string | null) =>
    productos.find((p) => p.id === id)?.nombre ?? "Producto eliminado";

  return (
    <div className="hidden print:block">
      <div className="mx-auto w-full max-w-xs rounded-lg border border-zinc-200 bg-white p-4 font-mono text-xs text-zinc-900">
        <p className="text-center font-bold">COMANDA</p>
        <p className="text-center">{sucursalNombre}</p>
        <p className="mt-1 text-center">
          {new Date().toLocaleString("es-AR")}
        </p>
        <div className="my-2 border-t border-dashed border-zinc-400" />

        <p>Cliente: {comanda.pedido.cliente_nombre}</p>
        {comanda.pedido.cliente_telefono && (
          <p>Tel: {comanda.pedido.cliente_telefono}</p>
        )}
        <p>
          Tipo: {comanda.pedido.tipo === "evento" ? "Evento/fiesta" : "Online"}
        </p>
        {comanda.pedido.fecha_evento && (
          <p>Fecha del evento: {comanda.pedido.fecha_evento}</p>
        )}

        <div className="my-2 border-t border-dashed border-zinc-400" />

        {comanda.items.map((it) => (
          <div key={it.id} className="py-0.5">
            {it.cantidad} x {nombreProducto(it.producto_id)}
          </div>
        ))}

        {comanda.pedido.notas && (
          <>
            <div className="my-2 border-t border-dashed border-zinc-400" />
            <p>Notas: {comanda.pedido.notas}</p>
          </>
        )}
      </div>
    </div>
  );
}
