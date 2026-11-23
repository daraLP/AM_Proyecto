import { describe, expect, test } from "@jest/globals";
import { crearBloqueo } from "../src/utils/envioUnico";

describe("doble toque en guardar", () => {
  test("dos toques seguidos ejecutan una sola vez", () => {
    let t = 0; let n = 0;
    const b = crearBloqueo(600, () => t);
    expect(b.ejecutar(() => { n++; })).toBe(true);
    t = 50;
    expect(b.ejecutar(() => { n++; })).toBe(false);
    expect(n).toBe(1);
  });
  test("pasado el enfriamiento vuelve a permitir", () => {
    let t = 0; let n = 0;
    const b = crearBloqueo(600, () => t);
    b.ejecutar(() => { n++; }); t = 700; b.ejecutar(() => { n++; });
    expect(n).toBe(2);
  });
  test("mientras la promesa sigue pendiente se ignora aunque pase el enfriamiento", async () => {
    let t = 0; let n = 0; let fin!: () => void;
    const b = crearBloqueo(600, () => t);
    b.ejecutar(() => { n++; return new Promise<void>((r) => { fin = r; }); });
    t = 5000;
    expect(b.ejecutar(() => { n++; })).toBe(false);
    fin(); await Promise.resolve(); await Promise.resolve();
    expect(b.ejecutar(() => { n++; })).toBe(true);
    expect(n).toBe(2);
  });
  test("si la promesa falla se libera", async () => {
    let t = 0;
    const b = crearBloqueo(0, () => t);
    b.ejecutar(() => Promise.reject(new Error("x")));
    await new Promise((r) => setTimeout(r, 0)); t = 1;
    expect(b.ejecutar(() => 1)).toBe(true);
  });
  test("si la función lanza, no queda bloqueado", () => {
    const b = crearBloqueo(600, () => 0);
    expect(() => b.ejecutar(() => { throw new Error("x"); })).toThrow();
    expect(b.ejecutar(() => 1)).toBe(true);
  });
});
