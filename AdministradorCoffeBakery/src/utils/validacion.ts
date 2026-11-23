// Validaciones y saneado de entradas del usuario. Funciones puras (sin React) para poder probarlas.

export const LIMITES = {
  nombreInsumo: 80,
  nombreProveedor: 80,
  nombrePersona: 60,
  categoria: 40,
  correo: 254,
  contrasenaMin: 6,
  contrasenaMax: 72,
  telefono: 20,
  direccion: 200,
  nota: 200,
  cantidadMax: 999_999,
  decimales: 3,
} as const;

/** Quita espacios de los extremos y colapsa los repetidos: «  Café   grano » → «Café grano». */
export function normalizarTexto(texto: string): string {
  return texto.replace(/\s+/g, " ").trim();
}

export type ResultadoTexto = { ok: true; valor: string } | { ok: false; error: string };

export function validarTexto(
  texto: string,
  { etiqueta, min = 1, max }: { etiqueta: string; min?: number; max: number },
): ResultadoTexto {
  const valor = normalizarTexto(texto);
  if (valor.length === 0) return { ok: false, error: `Escribe ${etiqueta}.` };
  if (valor.length < min) return { ok: false, error: `${capitalizar(etiqueta)} debe tener al menos ${min} letras.` };
  if (valor.length > max) return { ok: false, error: `${capitalizar(etiqueta)} admite máximo ${max} caracteres.` };
  return { ok: true, valor };
}

function capitalizar(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Teléfono opcional: dígitos, espacios, guiones, paréntesis y «+»; entre 7 y 20 caracteres. */
export function validarTelefono(texto: string): ResultadoTexto {
  const valor = normalizarTexto(texto);
  if (valor.length === 0) return { ok: true, valor: "" };
  if (valor.length > LIMITES.telefono || !/^[+()\d\s-]+$/.test(valor) || valor.replace(/\D/g, "").length < 7) {
    return { ok: false, error: "Escribe un teléfono válido, por ejemplo 646 111 2233." };
  }
  return { ok: true, valor };
}

export type ResultadoNumero = { ok: true; valor: number } | { ok: false; error: string };

/**
 * Convierte el texto de un campo numérico en un número validado.
 * Acepta «12,5» o «12.5». Rechaza vacío, texto, negativos, más de 3 decimales y valores enormes.
 */
export function validarCantidad(
  texto: string,
  { permitirCero = false, max = LIMITES.cantidadMax }: { permitirCero?: boolean; max?: number } = {},
): ResultadoNumero {
  const limpio = texto.trim().replace(",", ".");
  if (limpio === "") return { ok: false, error: "Escribe una cantidad." };
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(limpio)) {
    return { ok: false, error: "Escribe solo números, por ejemplo 5 o 2.5." };
  }
  const n = Number(limpio);
  if (!Number.isFinite(n)) return { ok: false, error: "Escribe solo números, por ejemplo 5 o 2.5." };
  if (n < 0) return { ok: false, error: "No puede ser negativo. Escribe 0 o más." };
  if (n === 0 && !permitirCero) return { ok: false, error: "La cantidad debe ser mayor que 0." };
  if (n > max) return { ok: false, error: `Es demasiado grande. El máximo es ${max.toLocaleString("en-US")}.` };
  const decimales = limpio.split(".")[1]?.length ?? 0;
  if (decimales > LIMITES.decimales) return { ok: false, error: `Usa máximo ${LIMITES.decimales} decimales.` };
  return { ok: true, valor: n };
}

/**
 * Filtra lo que se teclea en un campo numérico: deja dígitos y un solo separador decimal
 * (la coma se convierte en punto), con hasta 3 decimales. Sin signo salvo que se permita.
 */
export function filtrarEntradaNumerica(texto: string, { permitirNegativo = false }: { permitirNegativo?: boolean } = {}): string {
  let signo = "";
  let resto = texto;
  if (permitirNegativo && resto.trimStart().startsWith("-")) {
    signo = "-";
  }
  resto = resto.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const i = resto.indexOf(".");
  if (i !== -1) {
    resto = resto.slice(0, i + 1) + resto.slice(i + 1).replace(/\./g, "").slice(0, LIMITES.decimales);
  }
  return signo + resto;
}

/** Correo con formato razonable y longitud acotada. */
export function validarCorreo(texto: string): ResultadoTexto {
  const valor = texto.trim();
  if (valor.length === 0) return { ok: false, error: "Escribe tu correo." };
  if (valor.length > LIMITES.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    return { ok: false, error: "Escribe un correo válido, por ejemplo nombre@correo.com" };
  }
  return { ok: true, valor };
}
