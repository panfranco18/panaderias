import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type Rol = "superadmin" | "encargado_sucursal" | "empleado";

export type PerfilActual = {
  id: string;
  rol: Rol;
  sucursalId: string | null;
};

/**
 * Perfil del usuario autenticado en la request actual (vía cookies de sesión).
 * Devuelve null si no hay sesión o el perfil está inactivo/no existe.
 * Usa la service role solo para leer el perfil (evita depender de RLS acá),
 * pero la decisión de autorización queda en manos de quien llama a esta función.
 */
export async function getPerfilActual(): Promise<PerfilActual | null> {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: perfil } = await admin
    .from("perfiles")
    .select("id, rol, sucursal_id, activo")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil || !perfil.activo) return null;

  return { id: perfil.id, rol: perfil.rol as Rol, sucursalId: perfil.sucursal_id };
}

/**
 * Exige que haya un perfil logueado con uno de los roles permitidos.
 * Devuelve { error } si no se cumple, o { perfil } si está autorizado.
 */
export async function requireRol(
  rolesPermitidos: Rol[]
): Promise<{ error: string } | { perfil: PerfilActual }> {
  const perfil = await getPerfilActual();
  if (!perfil) return { error: "No estás autenticado." };
  if (!rolesPermitidos.includes(perfil.rol)) {
    return { error: "No tenés permiso para hacer esta acción." };
  }
  return { perfil };
}

/**
 * Como requireRol, pero además exige que la sucursal indicada coincida con
 * la del perfil — salvo que sea superadmin, que puede operar cualquier sucursal.
 */
export async function requireRolEnSucursal(
  rolesPermitidos: Rol[],
  sucursalId: string | null
): Promise<{ error: string } | { perfil: PerfilActual }> {
  const resultado = await requireRol(rolesPermitidos);
  if ("error" in resultado) return resultado;

  const { perfil } = resultado;
  if (perfil.rol === "superadmin") return { perfil };
  if (!sucursalId || perfil.sucursalId !== sucursalId) {
    return { error: "No tenés acceso a esa sucursal." };
  }
  return { perfil };
}
