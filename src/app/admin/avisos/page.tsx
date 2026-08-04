import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoAvisoForm } from "./nuevo-aviso-form";
import { AvisosList } from "./avisos-list";

export default async function AvisosPage() {
  const supabase = createAdminClient();

  const [{ data: avisos }, { data: empleados }] = await Promise.all([
    supabase
      .from("avisos_personal")
      .select("id, mensaje, perfil_id, fecha")
      .order("fecha", { ascending: false })
      .limit(60),
    supabase.from("perfiles").select("id, nombre").eq("activo", true).order("nombre"),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Avisos
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Saludo o recordatorio del día — aparece como cartel cuando el empleado entra al panel.
      </p>

      <div className="mt-6 max-w-lg">
        <NuevoAvisoForm empleados={empleados ?? []} />
      </div>

      <div className="mt-8">
        <AvisosList avisos={avisos ?? []} empleados={empleados ?? []} />
      </div>
    </div>
  );
}
