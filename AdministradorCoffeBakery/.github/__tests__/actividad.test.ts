import { describirMovimiento, tiempoRelativo } from "../src/utils/actividad";

const AHORA = new Date("2026-11-10T12:00:00Z").getTime();
const hace = (ms: number) => new Date(AHORA - ms).toISOString();

describe("tiempoRelativo", () => {
  it.each([
    [10_000, "ahora mismo"],
    [5 * 60_000, "hace 5 min"],
    [3 * 3_600_000, "hace 3 h"],
    [26 * 3_600_000, "ayer"],
    [3 * 86_400_000, "hace 3 días"],
  ])("%d ms → %s", (ms, esperado) => {
    expect(tiempoRelativo(hace(ms), AHORA)).toBe(esperado);
  });
  it("tolera valores vacíos o inválidos", () => {
    expect(tiempoRelativo(null)).toBe("");
    expect(tiempoRelativo("no-es-fecha")).toBe("");
  });
});

describe("describirMovimiento", () => {
  const base = { cantidad: 2, insumos: { nombre: "Leche entera", unidad_medida: "litros" } };

  it("otra persona: usa su nombre", () => {
    expect(describirMovimiento({ ...base, tipo: "salida", usuario_id: "u2", perfiles: { nombre: "María" } }, "u1")).toEqual({
      quien: "María",
      accion: "sacó 2 litros de Leche entera",
    });
  });
  it("yo: «Tú» y verbo en segunda persona", () => {
    expect(describirMovimiento({ ...base, tipo: "entrada", usuario_id: "u1", perfiles: { nombre: "Dueño" } }, "u1")).toEqual({
      quien: "Tú",
      accion: "agregaste 2 litros a Leche entera",
    });
  });
  it("sin datos del perfil: «Alguien»", () => {
    expect(describirMovimiento({ ...base, tipo: "salida", usuario_id: "u9", perfiles: null }, "u1").quien).toBe("Alguien");
  });
});
