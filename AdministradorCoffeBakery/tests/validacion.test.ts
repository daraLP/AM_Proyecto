import { describe, expect, test } from "@jest/globals";
import {
  LIMITES, filtrarEntradaNumerica, normalizarTexto, validarCantidad, validarCorreo, validarTelefono, validarTexto,
} from "../src/utils/validacion";

describe("campos vacíos", () => {
  test("texto vacío", () => expect(validarTexto("", { etiqueta: "el nombre", max: 80 }).ok).toBe(false));
  test("solo espacios", () => expect(validarTexto("     ", { etiqueta: "el nombre", max: 80 }).ok).toBe(false));
  test("cantidad vacía", () => expect(validarCantidad("").ok).toBe(false));
  test("correo vacío", () => expect(validarCorreo("").ok).toBe(false));
  test("teléfono vacío es válido (opcional)", () => expect(validarTelefono("  ")).toEqual({ ok: true, valor: "" }));
});

describe("texto donde va un número / negativos", () => {
  for (const t of ["abc", "12abc", "1e5", "0x1F", "--3", "1.2.3", "Infinity", "NaN", "1,2,3", "$5"]) {
    test(`rechaza «${t}»`, () => expect(validarCantidad(t, { permitirCero: true }).ok).toBe(false));
  }
  test("negativo", () => expect(validarCantidad("-5", { permitirCero: true })).toEqual({ ok: false, error: "No puede ser negativo. Escribe 0 o más." }));
  test("cero no permitido por defecto", () => expect(validarCantidad("0").ok).toBe(false));
  test("cero permitido", () => expect(validarCantidad("0", { permitirCero: true })).toEqual({ ok: true, valor: 0 }));
  test("coma decimal", () => expect(validarCantidad("2,5")).toEqual({ ok: true, valor: 2.5 }));
  test("4 decimales", () => expect(validarCantidad("1.2345").ok).toBe(false));
  test("tope máximo", () => expect(validarCantidad("1000000").ok).toBe(false));
  test("justo en el tope", () => expect(validarCantidad("999999").ok).toBe(true));
  test("número gigante no rompe", () => expect(validarCantidad("9".repeat(400)).ok).toBe(false));
});

describe("filtrarEntradaNumerica (mientras se teclea)", () => {
  test("quita letras", () => expect(filtrarEntradaNumerica("12abc3")).toBe("123"));
  test("coma → punto", () => expect(filtrarEntradaNumerica("2,5")).toBe("2.5"));
  test("un solo separador", () => expect(filtrarEntradaNumerica("1.2.3")).toBe("1.23"));
  test("máx 3 decimales", () => expect(filtrarEntradaNumerica("1.23456")).toBe("1.234"));
  test("sin negativos", () => expect(filtrarEntradaNumerica("-5")).toBe("5"));
  test("con negativos si se permite", () => expect(filtrarEntradaNumerica("-5", { permitirNegativo: true })).toBe("-5"));
  test("emoji y símbolos", () => expect(filtrarEntradaNumerica("😀5€")).toBe("5"));
});

describe("texto muy largo", () => {
  const largo = "a".repeat(200);
  test("nombre de 200 letras se rechaza", () => {
    const r = validarTexto(largo, { etiqueta: "el nombre", max: LIMITES.nombreInsumo });
    expect(r.ok).toBe(false);
  });
  test("nombre de 80 letras pasa", () => expect(validarTexto("a".repeat(80), { etiqueta: "el nombre", max: 80 }).ok).toBe(true));
  test("espacios repetidos se colapsan", () => expect(normalizarTexto("  Café    grano \n ")).toBe("Café grano"));
  test("correo de 300 caracteres se rechaza", () => expect(validarCorreo("a".repeat(300) + "@x.com").ok).toBe(false));
  test("teléfono largo se rechaza", () => expect(validarTelefono("1".repeat(30)).ok).toBe(false));
  test("teléfono con letras se rechaza", () => expect(validarTelefono("llamar ya").ok).toBe(false));
  test("teléfono normal pasa", () => expect(validarTelefono("646 111 2233").ok).toBe(true));
});
