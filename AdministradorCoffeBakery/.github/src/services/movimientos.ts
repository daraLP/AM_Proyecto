import { supabase } from "../lib/supabaseClient";
import { aErrorUsuario, codigoDeError, mensajeDeError } from "../utils/errores";
import type {
  Motivo,
  MovimientoActividad,
  MovimientoConUsuario,
  MovimientoInventario,
} from "../types/database";

// Conservado por compatibilidad: toda la traducción vive en utils/errores.ts
export function traducirError(error: unknown): string {
  return mensajeDeError(error);
}

interface Params {
  insumoId: string;
  delta: number; // positivo = entrada, negativo = salida
  motivo: Motivo;
  nota?: string;
  opId?: string; // idempotencia ante reintentos
}

export async function registrarMovimiento({
  insumoId,
  delta,
  motivo,
  nota,
  opId,
}: Params): Promise<{
  data: MovimientoInventario | null;
  error: string | null;
  codigo?: string; // p. ej. "stock_insuficiente"
}> {
  const llamar = () =>
    supabase.rpc("registrar_movimiento", {
      p_insumo_id: insumoId,
      p_delta: delta,
      p_motivo: motivo,
      p_nota: nota?.trim() || undefined, // las RPC tipadas aceptan undefined, no null
      p_client_op_id: opId,
    });

  let { data, error } = await llamar();

  // 23505 con opId = otra solicitud idéntica va en curso: no hay doble aplicación;
  // se reintenta una vez para obtener el movimiento ya registrado.
  if (error?.code === "23505" && opId) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    ({ data, error } = await llamar());
  }

  if (error) return { data: null, error: traducirError(error), codigo: codigoDeError(error) };
  return { data: data as MovimientoInventario, error: null };
}

export async function listarMovimientos(
  insumoId: string,
  limite = 5,
): Promise<MovimientoConUsuario[]> {
  const { data, error } = await supabase
    .from("movimientos_inventario")
    .select("*, perfiles(nombre)")
    .eq("insumo_id", insumoId)
    .order("creado_en", { ascending: false })
    .limit(limite);
  if (error) throw aErrorUsuario(error);
  return (data ?? []) as unknown as MovimientoConUsuario[];
}

// Últimos movimientos de todo el equipo, con nombre de quien los hizo (RLS: lectura para autenticados)
export async function listarActividad(limite = 50): Promise<MovimientoActividad[]> {
  const { data, error } = await supabase
    .from("movimientos_inventario")
    .select("*, perfiles(nombre), insumos(nombre, unidad_medida)")
    .order("creado_en", { ascending: false })
    .limit(limite);
  if (error) throw aErrorUsuario(error);
  return (data ?? []) as unknown as MovimientoActividad[];
}
