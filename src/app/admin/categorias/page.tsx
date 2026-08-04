import { createAdminClient } from "@/lib/supabase/admin";
import { NuevaCategoriaForm } from "./nueva-categoria-form";
import { CategoriasList } from "./categorias-list";

export default async function CategoriasPage() {
  const supabase = createAdminClient();

  const [{ data: categorias, error }, { data: productos }] = await Promise.all([
    supabase.from("categorias_config").select("*").order("categoria"),
    supabase.from("productos").select("categoria").eq("activo", true),
  ]);

  const conteos: Record<string, number> = {};
  for (const p of productos ?? []) {
    conteos[p.categoria] = (conteos[p.categoria] ?? 0) + 1;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Categorías
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Creá categorías nuevas y subile una imagen a cada una para el banner
        de la página de inicio. Las que no tienen imagen muestran un ícono
        genérico.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error.message}
        </p>
      )}

      <div className="mt-6 max-w-lg">
        <NuevaCategoriaForm />
      </div>

      <div className="mt-8">
        <CategoriasList categorias={categorias ?? []} conteos={conteos} />
      </div>
    </div>
  );
}
