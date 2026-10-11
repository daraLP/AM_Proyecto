import { supabase } from "../lib/supabaseClient";
import type { Insumo, UnidadMedida } from "../types/database";
import { registrarMovimiento, traducirError } from "./movimientos";

export interface DatosInsumo {
  nombre: string;
  unidad_medida: UnidadMedida;
  stock_minimo: number;
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

// El stock NO se envía en el insert: el stock inicial se registra como movimiento (queda en el historial)
export async function crearInsumo(datos: DatosInsumo, stockInicial: number) {
  const { data, error } = await supabase
    .from("insumos")
    .insert(datos)
    .select("id")
    .single();
  if (error) return { error: traducirError(error) };

  if (stockInicial > 0) {
    const r = await registrarMovimiento({
      insumoId: data.id,
      delta: stockInicial,
      motivo: "Ajuste de inventario",
      nota: "Stock inicial",
    });
    if (r.error)
      return {
        error: `El insumo se creó, pero no se registró el stock inicial: ${r.error}`,
      };
  }
  return { error: null };
}

// Nunca incluir stock_actual aquí: el trigger de la base lo rechaza
export async function actualizarInsumo(id: string, datos: DatosInsumo) {
  const { error } = await supabase.from("insumos").update(datos).eq("id", id);
  return { error: error ? traducirError(error) : null };
}

// Baja lógica: conserva el historial
export async function desactivarInsumo(id: string) {
  const { error } = await supabase
    .from("insumos")
    .update({ activo: false })
    .eq("id", id);
  return { error: error ? traducirError(error) : null };
}
