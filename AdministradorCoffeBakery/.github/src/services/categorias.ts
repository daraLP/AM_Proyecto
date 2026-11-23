import { supabase } from "../lib/supabaseClient";
import type { Categoria } from "../types/database";
import { traducirError } from "./movimientos";
import { aErrorUsuario } from "../utils/errores";

export async function listarCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase.from("categorias").select("*").order("nombre");
  if (error) throw aErrorUsuario(error);
  return data ?? [];
}

export async function crearCategoria(nombre: string) {
  const { error } = await supabase.from("categorias").insert({ nombre: nombre.trim() });
  if (error?.code === "23505") return { error: "Ya tienes una categoría con ese nombre. Usa otro nombre." };
  return { error: error ? traducirError(error) : null };
}

export async function renombrarCategoria(id: string, nombre: string) {
  const { error } = await supabase
    .from("categorias")
    .update({ nombre: nombre.trim() })
    .eq("id", id);
  if (error?.code === "23505") return { error: "Ya tienes una categoría con ese nombre. Usa otro nombre." };
  return { error: error ? traducirError(error) : null };
}

export async function eliminarCategoria(id: string) {
  const { error } = await supabase.from("categorias").delete().eq("id", id);
  if (error?.code === "23503")
    return { error: "No se puede eliminar: hay insumos que usan esta categoría. Cámbiales la categoría primero." };
  return { error: error ? traducirError(error) : null };
}
