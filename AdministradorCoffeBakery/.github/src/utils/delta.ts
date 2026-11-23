import { redondear3 } from "./formato";

export const LIMITE_SUPERIOR_DELTA = 999_999;

// RN-01: el delta nunca puede dejar el stock por debajo de 0 ni superar el límite superior
export function acotarDelta(delta: number, stockActual: number): number {
  if (!Number.isFinite(delta)) return 0;
  const minimo = -Math.max(stockActual, 0);
  // `|| 0` evita devolver -0 cuando el stock es 0
  return redondear3(Math.min(Math.max(delta, minimo), LIMITE_SUPERIOR_DELTA)) || 0;
}

export function stockProyectado(stockActual: number, delta: number): number {
  return redondear3(stockActual + delta);
}
