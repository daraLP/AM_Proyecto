import { ErrorUsuario, MENSAJES, aErrorUsuario, codigoDeError, mensajeDeError } from "../src/utils/errores";

describe("mensajeDeError", () => {
  it.each([
    ["Network request failed", MENSAJES.red],
    ["TypeError: Failed to fetch", MENSAJES.red],
    ["Request timed out", MENSAJES.lento],
  ])("red/tiempo: %s", (message, esperado) => {
    expect(mensajeDeError(new TypeError(message))).toBe(esperado);
  });

  it.each([
    [{ code: "invalid_credentials", message: "Invalid login credentials" }, MENSAJES.credenciales],
    [{ message: "Email not confirmed" }, MENSAJES.correoSinConfirmar],
    [{ code: "user_already_exists", message: "User already registered" }, MENSAJES.cuentaExistente],
    [{ message: "email rate limit exceeded" }, MENSAJES.demasiadosIntentos],
    [{ code: "over_email_send_rate_limit", message: "x", status: 429 }, MENSAJES.demasiadosIntentos],
    [{ code: "weak_password", message: "Password should be at least 6 characters" }, MENSAJES.contrasenaDebil],
    [{ code: "signup_disabled", message: "Signups not allowed" }, MENSAJES.registroCerrado],
    [{ message: "JWT expired" }, MENSAJES.sesionTerminada],
    [{ code: "PGRST303", message: "JWT issued at future" }, MENSAJES.relojDesfasado],
  ])("cuenta y sesión: %j", (error, esperado) => {
    expect(mensajeDeError(error)).toBe(esperado);
  });

  it.each([
    [{ code: "23514", message: "stock_insuficiente" }, MENSAJES.stockInsuficiente],
    [{ code: "23514", message: "violates check constraint" }, MENSAJES.datosInvalidos],
    [{ code: "42501", message: "permission denied" }, MENSAJES.sinPermiso],
    [{ code: "42501", message: "El stock solo puede modificarse registrando un movimiento" }, MENSAJES.stockDirecto],
    [{ code: "P0002", message: "x" }, MENSAJES.noExiste],
    [{ code: "23505", message: "duplicate key" }, MENSAJES.duplicado],
    [{ code: "23503", message: "foreign key" }, MENSAJES.enUso],
    [{ code: "23502", message: "null value" }, MENSAJES.faltaDato],
    [{ code: "22003", message: "numeric field overflow" }, MENSAJES.numeroGrande],
    [{ code: "40001", message: "could not serialize" }, MENSAJES.concurrencia],
    [{ code: "57014", message: "statement timeout" }, MENSAJES.lento],
  ])("base de datos: %j", (error, esperado) => {
    expect(mensajeDeError(error)).toBe(esperado);
  });

  it("fotos y servidor", () => {
    expect(mensajeDeError({ message: "The object exceeded the maximum allowed size" })).toBe(MENSAJES.fotoPesada);
    expect(mensajeDeError({ message: "mime type image/gif is not supported" })).toBe(MENSAJES.fotoFormato);
    expect(mensajeDeError({ status: 503, message: "x" })).toBe(MENSAJES.servicio);
  });

  it("un ErrorUsuario se muestra tal cual", () => {
    expect(mensajeDeError(new ErrorUsuario("Mensaje propio"))).toBe("Mensaje propio");
  });

  it("nunca filtra texto técnico desconocido: usa el mensaje por defecto", () => {
    const crudo = new Error('relation "xyz" does not exist (SQLSTATE 42P01)');
    expect(mensajeDeError(crudo)).toBe(MENSAJES.generico);
    expect(mensajeDeError(crudo, "No pudimos guardar. Inténtalo de nuevo.")).toBe("No pudimos guardar. Inténtalo de nuevo.");
    expect(mensajeDeError(undefined)).toBe(MENSAJES.generico);
  });
});

describe("tono de los mensajes", () => {
  const textos = Object.values(MENSAJES);

  it("ninguno contiene jerga técnica", () => {
    const prohibidas = /\b(error \d+|sqlstate|jwt|token|rls|rpc|null|undefined|exception|stack|http|api|postgres|supabase|constraint)\b/i;
    for (const t of textos) expect(t).not.toMatch(prohibidas);
  });

  it("son breves y terminan en punto", () => {
    for (const t of textos) {
      expect(t.length).toBeLessThanOrEqual(150);
      expect(t.endsWith(".")).toBe(true);
    }
  });
});

describe("códigos y ErrorUsuario", () => {
  it("detecta stock insuficiente por código", () => {
    expect(codigoDeError({ code: "23514", message: "stock_insuficiente" })).toBe("stock_insuficiente");
    expect(codigoDeError({ code: "42501", message: "x" })).toBeUndefined();
  });

  it("aErrorUsuario conserva el código", () => {
    const e = aErrorUsuario({ code: "23514", message: "stock_insuficiente" });
    expect(e).toBeInstanceOf(ErrorUsuario);
    expect(e.codigo).toBe("stock_insuficiente");
    expect(e.message).toBe(MENSAJES.stockInsuficiente);
  });
});
