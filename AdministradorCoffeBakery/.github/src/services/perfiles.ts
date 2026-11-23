import type { Perfil, Rol } from "../types/database";
import { supabase } from "../lib/supabaseClient";
import { aErrorUsuario, mensajeDeError } from "../utils/errores";

const ESPERAS_REINTENTO_MS = [400, 1000, 2000];

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function esDesfaseDeReloj(error: { code?: string; message: string }): boolean {
  return (
    error.code === "PGRST303" ||
    error.message.toLowerCase().includes("issued at future")
  );
}

export async function obtenerPerfil(
  userId: string,
): Promise<{ data: Perfil | null; error: string | null }> {
  for (let intento = 0; ; intento++) {
    const { data, error } = await supabase
      .from("perfiles")
      .select("id,nombre,rol")
      .eq("id", userId)
      .maybeSingle();

    if (!error) {
      return { data: data as Perfil | null, error: null };
    }

    const espera = esDesfaseDeReloj(error)
      ? ESPERAS_REINTENTO_MS[intento]
      : undefined;

    if (espera !== undefined) {
      console.warn(
        `Error temporal al cargar el perfil; reintentando en ${espera} ms.`,
        error,
      );
      await esperar(espera);
      continue;
    }

    console.error("Error al cargar el perfil.", error);
    return {
      data: null,
      error: mensajeDeError(error, "No pudimos cargar tu perfil. Revisa tu conexión e inténtalo de nuevo."),
    };
  }
}

// Gestión de usuarios (RF-16): solo el administrador ve y cambia a todos (RLS admin_gestiona_perfiles)
export async function listarPerfiles(): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from("perfiles")
    .select("id,nombre,rol,creado_en")
    .order("nombre");
  if (error) throw aErrorUsuario(error);
  return (data ?? []) as Perfil[];
}

export async function cambiarRol(userId: string, rol: Rol): Promise<void> {
  const { error } = await supabase.from("perfiles").update({ rol }).eq("id", userId);
  if (error) throw aErrorUsuario(error);
}

export async function actualizarNombre(userId: string, nombre: string): Promise<void> {
  const { error } = await supabase
    .from("perfiles")
    .update({ nombre: nombre.trim() })
    .eq("id", userId);
  if (error) throw aErrorUsuario(error);
}
