import { supabase } from "../lib/supabaseClient";
import type { Motivo } from "../types/database";

export function traducirError(error: {
  code?: string;
  message: string;
}): string {
  if (error.code === "23514" || error.message.includes("stock_insuficiente"))
    return "No hay stock suficiente para esta salida.";
  if (error.code === "42501")
    return "No tienes permiso para realizar esta acción.";
  if (error.code === "P0002")
    return "El insumo ya no existe o fue desactivado.";
  if (error.code === "22023")
    return "Datos inválidos: revisa la cantidad y el motivo.";
  return error.message;
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
}: Params) {
  const { data, error } = await supabase.rpc("registrar_movimiento", {
    p_insumo_id: insumoId,
    p_delta: delta,
    p_motivo: motivo,
    p_nota: nota?.trim() ? nota.trim() : null,
    p_client_op_id: opId ?? null,
  });
  return { data, error: error ? traducirError(error) : null };
}
