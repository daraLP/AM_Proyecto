import { describe, expect, test } from "@jest/globals";
import { ErrorUsuario, MENSAJES, codigoDeError, mensajeDeError } from "../src/utils/errores";
import { formatearCantidad, formatearDistancia, formatearFecha, parsearNumero } from "../src/utils/formato";
import { acotarDelta, stockProyectado } from "../src/utils/delta";
import { describirMovimiento, tiempoRelativo } from "../src/utils/actividad";

(globalThis as any).__DEV__ = false;

describe("modo avión: errores de red se explican bien", () => {
  for (const m of ["Network request failed", "Failed to fetch", "Load failed", "The Internet connection appears to be offline."]) {
    test(m, () => expect(mensajeDeError(new Error(m))).toBe(MENSAJES.red));
  }
  test("timeout", () => expect(mensajeDeError(new Error("Request timed out"))).toBe(MENSAJES.lento));
  test("nunca muestra texto crudo", () => expect(mensajeDeError({ message: "pg: relation x does not exist" })).toBe(MENSAJES.generico));
  test("ErrorUsuario se muestra tal cual", () => expect(mensajeDeError(new ErrorUsuario("hola"))).toBe("hola"));
  test("stock insuficiente trae código", () => expect(codigoDeError({ code: "23514", message: "stock_insuficiente" })).toBe("stock_insuficiente"));
  test("valor fuera de rango numérico", () => expect(mensajeDeError({ code: "22003", message: "x" })).toBe(MENSAJES.numeroGrande));
  test("null y undefined no rompen", () => { expect(mensajeDeError(null)).toBe(MENSAJES.generico); expect(mensajeDeError(undefined)).toBe(MENSAJES.generico); });
});

describe("formato", () => {
  test("cantidad sin ceros sobrantes", () => { expect(formatearCantidad(4)).toBe("4"); expect(formatearCantidad(2.5)).toBe("2.5"); });
  test("cantidad NaN/Infinity", () => { expect(formatearCantidad(NaN)).toBe("0"); expect(formatearCantidad(Infinity)).toBe("0"); });
  test("distancia", () => { expect(formatearDistancia(850)).toBe("850 m"); expect(formatearDistancia(2300)).toBe("2.3 km"); expect(formatearDistancia(null)).toBe(""); });
  test("fecha inválida", () => { expect(formatearFecha("no-es-fecha")).toBe(""); expect(formatearFecha(null)).toBe(""); });
  test("parsearNumero: vacío, signo y punto solos", () => { for (const t of ["", " ", "-", ".", "-."]) expect(parsearNumero(t)).toBe(0); });
  test("parsearNumero: válidos", () => { expect(parsearNumero("12,5")).toBe(12.5); expect(parsearNumero(" 7 ")).toBe(7); expect(parsearNumero("-3")).toBe(-3); expect(parsearNumero(".5")).toBe(0.5); });
});

describe("delta / stock (salir y volver, otro dispositivo cambió el stock)", () => {
  test("acota a lo disponible", () => expect(acotarDelta(-20, 5)).toBe(-5));
  test("stock 0: no se puede restar", () => expect(acotarDelta(-1, 0)).toBe(0));
  test("stock negativo (dato corrupto) se trata como 0", () => expect(acotarDelta(-1, -4)).toBe(0));
  test("Infinity", () => expect(acotarDelta(Infinity, 5)).toBe(0));
  test("sin errores de coma flotante", () => expect(stockProyectado(0.1, 0.2)).toBe(0.3));
});

describe("actividad (lista vacía y datos incompletos)", () => {
  test("movimiento sin perfil ni insumo", () => expect(describirMovimiento({ tipo: "entrada", cantidad: 2 }).quien).toBe("Alguien"));
  test("tú", () => expect(describirMovimiento({ tipo: "salida", cantidad: 1, usuario_id: "a" }, "a").accion).toContain("sacaste"));
  test("tiempo relativo con fecha nula", () => expect(tiempoRelativo(null)).toBe(""));
  test("tiempo relativo con basura", () => expect(tiempoRelativo("basura")).toBe(""));
  test("ahora mismo", () => { const n = Date.now(); expect(tiempoRelativo(new Date(n - 5000).toISOString(), n)).toBe("ahora mismo"); });
  test("fecha en el futuro (reloj desfasado) no da negativos", () => { const n = Date.now(); expect(tiempoRelativo(new Date(n + 3_600_000).toISOString(), n)).toBe("ahora mismo"); });
});
