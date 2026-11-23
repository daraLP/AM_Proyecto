import { acotarDelta, stockProyectado } from "../src/utils/delta";
import { formatearCantidad, formatearDistancia, parsearNumero } from "../src/utils/formato";
import { generarUuid } from "../src/utils/uuid";

test("formatearDistancia: metros y kilómetros", () => {
  expect(formatearDistancia(850)).toBe("850 m");
  expect(formatearDistancia(2300)).toBe("2.3 km");
  expect(formatearDistancia(null)).toBe("");
});
test("parsearNumero acepta coma y vacío", () => {
  expect(parsearNumero("12,5")).toBe(12.5);
  expect(parsearNumero("")).toBe(0);
  expect(parsearNumero("-")).toBe(0);
});
test("formatearCantidad quita ceros sobrantes", () => {
  expect(formatearCantidad(4)).toBe("4");
  expect(formatearCantidad(2.5)).toBe("2.5");
});
test("RN-01: el delta nunca deja el stock negativo", () => {
  expect(acotarDelta(-6, 10)).toBe(-6);
  expect(acotarDelta(-20, 10)).toBe(-10);
  expect(acotarDelta(2_000_000, 0)).toBe(999_999);
});
test("CA-01: stock 10 − 6 = 4", () => {
  expect(stockProyectado(10, -6)).toBe(4);
});
test("generarUuid produce un UUID v4 distinto cada vez", () => {
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const a = generarUuid();
  expect(a).toMatch(re);
  expect(generarUuid()).not.toBe(a);
});
