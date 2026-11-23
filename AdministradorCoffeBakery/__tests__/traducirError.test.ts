import { traducirError } from "../src/services/movimientos";
import { MENSAJES } from "../src/utils/errores";

test("traducirError delega en el traductor central", () => {
  expect(traducirError({ code: "23514", message: "stock_insuficiente" })).toBe(MENSAJES.stockInsuficiente);
  expect(traducirError({ code: "42501", message: "x" })).toBe(MENSAJES.sinPermiso);
  expect(traducirError({ code: "P0002", message: "x" })).toBe(MENSAJES.noExiste);
  expect(traducirError({ code: "22023", message: "x" })).toBe(MENSAJES.datosInvalidos);
});
