const secciones = [
  { href: "/admin/sucursales", label: "Sucursales" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/ventas", label: "Ventas" },
  { href: "/admin/facturacion", label: "Facturación" },
];

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Panel admin
      </h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {secciones.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="rounded-lg border border-zinc-200 bg-white p-4 text-center font-medium text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
