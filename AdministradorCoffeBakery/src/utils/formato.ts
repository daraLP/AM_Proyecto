// Formato de distancia (spec §3.3): < 1000 m → «850 m»; si no, «2.3 km»
export function formatearDistancia(metros: number | null | undefined): string {
  if (metros === null || metros === undefined || !Number.isFinite(metros)) return "";
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1)} km`;
}

// Cantidades con hasta 3 decimales, sin ceros sobrantes: 4 → "4", 2.5 → "2.5"
export function formatearCantidad(valor: number): string {
  if (!Number.isFinite(valor)) return "0";
  return String(Math.round(valor * 1000) / 1000);
}

export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return "";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "12,5" o "12.5" → 12.5; vacío o inválido → 0.
// Solo se aceptan dígitos con un separador decimal y signo opcional: «0x10», «1e3» o «1.2.3» valen 0.
export function parsearNumero(texto: string): number {
  const limpio = texto.trim().replace(",", ".");
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(limpio)) return 0;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : 0;
}

export function redondear3(valor: number): number {
  return Math.round(valor * 1000) / 1000;
}
