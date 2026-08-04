import { createAdminClient } from "@/lib/supabase/admin";
import { getPerfilActual } from "@/lib/auth/current-perfil";
import { ConfiguracionForm } from "./configuracion-form";
import { MiCuentaForm } from "./mi-cuenta-form";

export default async function ConfiguracionPage() {
  const supabase = createAdminClient();
  const perfilActual = await getPerfilActual();

  const [{ data: config, error }, { data: miPerfil }] = await Promise.all([
    supabase.from("configuracion_negocio").select("*").limit(1).maybeSingle(),
    perfilActual
      ? supabase.from("perfiles").select("nombre").eq("id", perfilActual.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Configuración
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Datos de pago que ve el cliente al elegir MercadoPago en el checkout.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6 flex max-w-md flex-col gap-6">
        <MiCuentaForm nombre={miPerfil?.nombre ?? ""} />
        <ConfiguracionForm config={config} />
      </div>
    </div>
  );
}
