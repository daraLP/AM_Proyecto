import { supabase } from "../lib/supabaseClient";
import type { Insumo, UnidadMedida } from "../types/database";
import { registrarMovimiento, traducirError } from "./movimientos";
import { aErrorUsuario } from "../utils/errores";

export const TAMANO_PAGINA = 20;

export interface DatosInsumo {
  nombre: string;
  unidad_medida: UnidadMedida;
  stock_minimo: number;
  categoria_id?: string | null;
  proveedor_principal_id?: string | null;
  foto_url?: string | null;
}

export interface FiltrosInsumos {
  categoriaId?: string | null;
  busqueda?: string;
  estado?: "bajo" | "agotado" | null;
}

export async function listarInsumos() {
  const { data, error } = await supabase
    .from("insumos")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  return {
    data: (data ?? []) as Insumo[],
    error: error ? traducirError(error) : null,
  };
}

// Escapa % y _ para que la búsqueda no se interprete como comodines de LIKE
function escaparLike(texto: string): string {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// Página de inventario (RF-05): 20 por página, filtros por categoría/estado y búsqueda
export async function listarInsumosPaginado(
  pagina: number,
  filtros: FiltrosInsumos = {},
): Promise<Insumo[]> {
  const desde = pagina * TAMANO_PAGINA;
  let consulta = supabase
    .from("insumos")
    .select("*")
    .eq("activo", true)
    .order("nombre")
    .range(desde, desde + TAMANO_PAGINA - 1);

  if (filtros.categoriaId) consulta = consulta.eq("categoria_id", filtros.categoriaId);
  if (filtros.estado) consulta = consulta.eq("estado_stock", filtros.estado);
  const q = filtros.busqueda?.trim();
  if (q) consulta = consulta.ilike("nombre", `%${escaparLike(q)}%`);

  const { data, error } = await consulta;
  if (error) throw aErrorUsuario(error);
  return (data ?? []) as Insumo[];
}

export async function obtenerInsumo(id: string) {
  const { data, error } = await supabase
    .from("insumos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return {
    data: (data ?? null) as Insumo | null,
    error: error ? traducirError(error) : null,
  };
}

// El stock NO se envía en el insert: el stock inicial se registra como movimiento (queda en el historial)
export async function crearInsumo(
  datos: DatosInsumo,
  stockInicial: number,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("insumos")
    .insert(datos)
    .select("id")
    .single();
  if (error) return { id: null, error: traducirError(error) };

  if (stockInicial > 0) {
    const r = await registrarMovimiento({
      insumoId: data.id,
      delta: stockInicial,
      motivo: "Ajuste de inventario",
      nota: "Stock inicial",
    });
    if (r.error)
      return {
        id: data.id,
        error: `El insumo se creó, pero no se registró el stock inicial: ${r.error}`,
      };
  }
  return { id: data.id, error: null };
}

// Nunca incluir stock_actual aquí: el trigger de la base lo rechaza
export async function actualizarInsumo(id: string, datos: Partial<DatosInsumo>) {
  const { error } = await supabase.from("insumos").update(datos).eq("id", id);
  return { error: error ? traducirError(error) : null };
}

// Baja lógica: conserva el historial (solo administrador; la RLS lo impone)
export async function desactivarInsumo(id: string) {
  const { error } = await supabase
    .from("insumos")
    .update({ activo: false })
    .eq("id", id);
  return { error: error ? traducirError(error) : null };
}
