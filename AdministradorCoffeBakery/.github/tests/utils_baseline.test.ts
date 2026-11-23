import { describe, expect, test } from "@jest/globals";
import { parsearNumero } from "../src/utils/formato";
// Regresión: estos casos fallaban en el código original (devolvían 16 y 1000)
describe("regresión parsearNumero", () => {
  test("0x10 → 0", () => expect(parsearNumero("0x10")).toBe(0));
  test("1e3 → 0", () => expect(parsearNumero("1e3")).toBe(0));
});
