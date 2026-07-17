import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoProveedorForm } from "./nuevo-proveedor-form";
import { ProveedoresList } from "./proveedores-list";
import { NuevaFacturaForm } from "./nueva-factura-form";
import { FacturasList } from "./facturas-list";

export default async function ProveedoresPage() {
  const supabase = createAdminClient();

  const [{ data: proveedores, error }, { data: sucursales }, { data: facturas }] =
    await Promise.all([
      supabase.from("proveedores").select("*").order("nombre"),
      supabase.from("sucursales").select("id, nombre").order("nombre"),
      supabase
        .from("facturas_proveedor")
        .select("*")
        .order("fecha", { ascending: false }),
    ]);

  const facturasConUrl = await Promise.all(
    (facturas ?? []).map(async (f) => {
      if (!f.imagen_url) return { ...f, imagen_signed_url: null };
      const { data } = await supabase.storage
        .from("facturas-proveedores")
        .createSignedUrl(f.imagen_url, 3600);
      return { ...f, imagen_signed_url: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Proveedores
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Alta de proveedores y carga de facturas de compra (solo superadmin).
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="max-w-lg">
          <NuevoProveedorForm />
          <div className="mt-6">
            <ProveedoresList proveedores={proveedores ?? []} />
          </div>
        </div>

        <div className="max-w-lg">
          <NuevaFacturaForm
            proveedores={proveedores ?? []}
            sucursales={sucursales ?? []}
          />
          <div className="mt-6">
            <FacturasList
              facturas={facturasConUrl}
              proveedores={proveedores ?? []}
              sucursales={sucursales ?? []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
