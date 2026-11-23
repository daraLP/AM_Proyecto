// Mensajes de error para el usuario: claros, breves, amables y con un siguiente paso concreto.
// Regla: la interfaz nunca muestra el texto crudo de Supabase/Postgres/red; todo pasa por aquí.

export const MENSAJES = {
  red: "No hay conexión a internet. Revisa tu Wi-Fi o tus datos móviles e inténtalo de nuevo.",
  lento: "La conexión está lenta y la operación tardó demasiado. Inténtalo de nuevo en un momento.",
  credenciales: "El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.",
  correoSinConfirmar:
    "Aún no confirmas tu correo. Abre el mensaje que te enviamos, toca el enlace y vuelve a iniciar sesión.",
  cuentaExistente: "Ya hay una cuenta con ese correo. Prueba iniciar sesión.",
  correoInvalido: "Ese correo no parece válido. Revisa que esté bien escrito, por ejemplo nombre@correo.com.",
  demasiadosIntentos: "Hiciste varios intentos seguidos. Espera unos minutos y vuelve a probar.",
  contrasenaDebil: "Esa contraseña es fácil de adivinar. Elige una más larga, con letras y números.",
  registroCerrado: "Por ahora no se pueden crear cuentas nuevas. Pídele acceso al administrador.",
  sesionTerminada: "Tu sesión terminó. Inicia sesión de nuevo para continuar.",
  relojDesfasado:
    "La fecha y la hora de tu teléfono no coinciden con las reales. Actívalas en automático en Ajustes e inténtalo de nuevo.",
  stockInsuficiente: "No hay suficiente stock para esa salida. Reduce la cantidad e inténtalo de nuevo.",
  stockDirecto: "El stock solo cambia registrando un movimiento. Usa el contador del insumo.",
  sinPermiso: "Tu cuenta no tiene permiso para hacer esto. Si lo necesitas, pídeselo a un administrador.",
  noExiste:
    "No encontramos este elemento; puede que otra persona lo haya eliminado. Vuelve atrás y actualiza la pantalla.",
  datosInvalidos: "Alguno de los datos no es válido. Revísalos e inténtalo de nuevo.",
  duplicado: "Ya existe un registro igual. Cambia el nombre o revisa los datos.",
  enUso: "No se puede eliminar porque todavía se usa en otro lugar. Quita primero esas relaciones.",
  faltaDato: "Falta un dato obligatorio. Completa todos los campos e inténtalo de nuevo.",
  numeroGrande: "Ese número es demasiado grande. Escribe una cantidad menor.",
  concurrencia: "Otra persona está actualizando lo mismo. Espera unos segundos e inténtalo de nuevo.",
  servicio: "Nuestro servicio no está respondiendo. Inténtalo de nuevo en unos minutos.",
  fotoPesada: "La foto es demasiado pesada. Toma otra o elige una más ligera.",
  fotoFormato: "Ese formato de imagen no es compatible. Usa una foto JPG o PNG.",
  generico:
    "Algo no salió como esperábamos. Inténtalo de nuevo; si el problema continúa, avísale a un administrador.",
} as const;

/** Error cuyo mensaje ya está redactado para el usuario: la interfaz puede mostrarlo tal cual. */
export class ErrorUsuario extends Error {
  readonly codigo?: string;

  constructor(mensaje: string, codigo?: string) {
    super(mensaje);
    this.name = "ErrorUsuario";
    this.codigo = codigo;
  }
}

interface ErrorCrudo {
  code?: unknown;
  message?: unknown;
  status?: unknown;
  statusCode?: unknown;
  name?: unknown;
}

function aTexto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

function aEstado(error: ErrorCrudo): number {
  const bruto = error.status ?? error.statusCode;
  const numero = typeof bruto === "string" ? Number(bruto) : bruto;
  return typeof numero === "number" && Number.isFinite(numero) ? numero : 0;
}

const incluye = (texto: string, ...pistas: string[]) => pistas.some((p) => texto.includes(p));

export function codigoDeError(error: unknown): string | undefined {
  if (error instanceof ErrorUsuario) return error.codigo;
  const cruda = (error ?? {}) as ErrorCrudo;
  const m = aTexto(cruda.message).toLowerCase();
  if (aTexto(cruda.code) === "23514" && incluye(m, "stock", "insuficiente")) return "stock_insuficiente";
  if (incluye(m, "stock_insuficiente")) return "stock_insuficiente";
  return undefined;
}

function clasificar(error: unknown): string | null {
  if (error === null || error === undefined) return null;
  const cruda: ErrorCrudo = typeof error === "string" ? { message: error } : (error as ErrorCrudo);
  const codigo = aTexto(cruda.code);
  const m = aTexto(cruda.message).toLowerCase();
  const estado = aEstado(cruda);

  // 1) Red y tiempos de espera (el texto cambia según plataforma)
  if (
    incluye(
      m,
      "network request failed",
      "failed to fetch",
      "network error",
      "networkerror",
      "load failed",
      "internet connection appears to be offline",
      "no address associated",
      "the network connection was lost",
    )
  )
    return MENSAJES.red;
  if (incluye(m, "timed out", "timeout", "aborterror", "aborted")) return MENSAJES.lento;

  // 2) Cuenta y sesión (Supabase Auth)
  if (codigo === "invalid_credentials" || incluye(m, "invalid login credentials")) return MENSAJES.credenciales;
  if (codigo === "email_not_confirmed" || incluye(m, "email not confirmed")) return MENSAJES.correoSinConfirmar;
  if (codigo === "user_already_exists" || codigo === "email_exists" || incluye(m, "already registered"))
    return MENSAJES.cuentaExistente;
  if (codigo === "email_address_invalid" || incluye(m, "unable to validate email", "invalid email"))
    return MENSAJES.correoInvalido;
  if (
    codigo === "over_email_send_rate_limit" ||
    codigo === "over_request_rate_limit" ||
    estado === 429 ||
    incluye(m, "rate limit", "too many requests")
  )
    return MENSAJES.demasiadosIntentos;
  if (codigo === "weak_password" || incluye(m, "password should be", "weak password"))
    return MENSAJES.contrasenaDebil;
  if (codigo === "signup_disabled" || incluye(m, "signups not allowed")) return MENSAJES.registroCerrado;
  if (codigo === "PGRST303" || incluye(m, "issued at future")) return MENSAJES.relojDesfasado;
  if (
    codigo === "PGRST301" ||
    codigo === "PGRST302" ||
    codigo === "bad_jwt" ||
    codigo === "session_not_found" ||
    codigo === "session_expired" ||
    codigo === "refresh_token_not_found" ||
    incluye(m, "jwt expired", "invalid jwt", "refresh token", "auth session missing")
  )
    return MENSAJES.sesionTerminada;

  // 3) Reglas de la base de datos (Postgres / PostgREST)
  if (codigo === "42501") {
    return incluye(m, "stock solo puede modificarse") ? MENSAJES.stockDirecto : MENSAJES.sinPermiso;
  }
  if (codigo === "23514") {
    return incluye(m, "stock", "insuficiente") ? MENSAJES.stockInsuficiente : MENSAJES.datosInvalidos;
  }
  if (incluye(m, "stock_insuficiente")) return MENSAJES.stockInsuficiente;
  if (codigo === "P0002" || codigo === "PGRST116") return MENSAJES.noExiste;
  if (codigo === "22023" || codigo === "22P02" || codigo === "22007") return MENSAJES.datosInvalidos;
  if (codigo === "22003") return MENSAJES.numeroGrande;
  if (codigo === "23505") return MENSAJES.duplicado;
  if (codigo === "23503") return MENSAJES.enUso;
  if (codigo === "23502") return MENSAJES.faltaDato;
  if (codigo === "40001" || codigo === "40P01" || codigo === "55P03") return MENSAJES.concurrencia;
  if (codigo === "57014") return MENSAJES.lento;

  // 4) Fotos (Storage)
  if (estado === 413 || incluye(m, "exceeded the maximum allowed size", "payload too large"))
    return MENSAJES.fotoPesada;
  if (incluye(m, "mime type", "invalid_mime_type")) return MENSAJES.fotoFormato;
  if (incluye(m, "row-level security", "violates row-level")) return MENSAJES.sinPermiso;

  // 5) Fallas del servidor
  if (estado >= 500 || incluye(m, "internal server error", "bad gateway", "service unavailable", "gateway"))
    return MENSAJES.servicio;

  return null;
}

/**
 * Convierte cualquier error en un mensaje listo para mostrar.
 * @param porDefecto texto para los errores no reconocidos (úsalo para dar contexto de la acción).
 */
export function mensajeDeError(error: unknown, porDefecto: string = MENSAJES.generico): string {
  if (error instanceof ErrorUsuario) return error.message;
  const reconocido = clasificar(error);
  if (reconocido) return reconocido;
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.warn("[error sin clasificar]", error);
  }
  return porDefecto;
}

/** Atajo para los servicios: construye el ErrorUsuario (con código) a partir de un error crudo. */
export function aErrorUsuario(error: unknown, porDefecto?: string): ErrorUsuario {
  return new ErrorUsuario(mensajeDeError(error, porDefecto), codigoDeError(error));
}
