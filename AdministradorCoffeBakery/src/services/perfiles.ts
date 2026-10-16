import type { Perfil } from "../types/database";
import { supabase } from "../lib/supabaseClient";
import { traducirError } from "./movimientos";

export async function obtenerPerfil(
  userId: string,
): Promise<{ data: Perfil | null; error: string | null }> {
  const { data, error } = await supabase
    .from("perfiles")
    .select("id,nombre,rol")
    .eq("id", userId)
    .maybeSingle();

  return {
    data: data as Perfil | null,
    error: error ? traducirError(error) : null,
  };
}
