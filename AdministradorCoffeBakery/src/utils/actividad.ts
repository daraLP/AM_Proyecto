import { formatearCantidad } from "./formato";

// «hace 5 min», «hace 2 h», «ayer», o la fecha si es más antiguo
export function tiempoRelativo(iso: string | null | undefined, ahora: number = Date.now()): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const seg = Math.max(0, Math.round((ahora - t) / 1000));
  if (seg < 45) return "ahora mismo";
  const min = Math.round(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ayer";
  if (d < 7) return `hace ${d} días`;
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

interface DatosMovimiento {
  tipo: string;
  cantidad: number;
  usuario_id?: string | null;
  perfiles?: { nombre: string } | null;
  insumos?: { nombre: string; unidad_medida: string } | null;
}

// «María sacó 2 litros de Leche» / «Tú agregaste 5 kg de Azúcar»
export function describirMovimiento(m: DatosMovimiento, miId?: string | null): { quien: string; accion: string } {
  const soyYo = Boolean(miId) && m.usuario_id === miId;
  const quien = soyYo ? "Tú" : (m.perfiles?.nombre ?? "Alguien");
  const entrada = m.tipo === "entrada";
  const verbo = entrada ? (soyYo ? "agregaste" : "agregó") : soyYo ? "sacaste" : "sacó";
  const unidad = m.insumos?.unidad_medida ? ` ${m.insumos.unidad_medida}` : "";
  const insumo = m.insumos?.nombre ? ` ${entrada ? "a" : "de"} ${m.insumos.nombre}` : "";
  return { quien, accion: `${verbo} ${formatearCantidad(m.cantidad)}${unidad}${insumo}` };
}
