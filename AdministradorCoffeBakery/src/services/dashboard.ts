import { supabase } from "../lib/supabaseClient";
import { ErrorUsuario, aErrorUsuario } from "../utils/errores";

export interface ResumenDashboard {
  total: number;
  bajo: number;
  agotado: number;
}

export interface ConsumoSemanal {
  dia: string;
  salidas: number;
}

// Una respuesta con formato inesperado es un problema nuestro: el detalle va al registro, no a la pantalla
function respuestaInvalida(detalle: string): never {
  console.warn(`[dashboard] ${detalle}`);
  throw new ErrorUsuario(
    "No pudimos mostrar estos datos. Jala hacia abajo para actualizar; si sigue igual, avísale a un administrador.",
  );
}

function numeroValido(valor: unknown, campo: string): number {
  const numero = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(numero)) {
    respuestaInvalida(`campo ${campo} inválido`);
  }
  return numero;
}

export async function obtenerResumenDashboard(): Promise<ResumenDashboard> {
  const { data, error } = await supabase.rpc("resumen_dashboard");
  if (error) throw aErrorUsuario(error);

  const fila = Array.isArray(data) ? data[0] : data;
  if (!fila || typeof fila !== "object") {
    respuestaInvalida("resumen no válido");
  }

  const resumen = fila as Record<string, unknown>;
  return {
    total: numeroValido(resumen.total, "total"),
    bajo: numeroValido(resumen.bajo, "bajo"),
    agotado: numeroValido(resumen.agotado, "agotado"),
  };
}

export async function obtenerConsumoSemanal(
  dias = 7,
): Promise<ConsumoSemanal[]> {
  if (!Number.isInteger(dias) || dias < 1) {
    throw new Error("El número de días debe ser un entero positivo.");
  }

  const { data, error } = await supabase.rpc("consumo_semanal", {
    p_dias: dias,
  });
  if (error) throw aErrorUsuario(error);
  if (!Array.isArray(data)) {
    respuestaInvalida("consumo semanal no es arreglo");
  }

  return data.map((fila) => {
    if (!fila || typeof fila !== "object") {
      respuestaInvalida("fila de consumo inválida");
    }
    const registro = fila as Record<string, unknown>;
    if (typeof registro.dia !== "string") {
      respuestaInvalida("día inválido");
    }
    return {
      dia: registro.dia,
      salidas: numeroValido(registro.salidas, "salidas"),
    };
  });
}

export interface ConsumoPorInsumo {
  insumo_id: string;
  nombre: string;
  unidad_medida: string;
  consumido: number;
  merma: number;
}

// Solo administrador (la RPC lanza 42501 para el resto)
export async function obtenerConsumoPorInsumo(
  desde: Date,
  hasta: Date,
): Promise<ConsumoPorInsumo[]> {
  const { data, error } = await supabase.rpc("consumo_por_insumo", {
    p_desde: desde.toISOString(),
    p_hasta: hasta.toISOString(),
  });
  if (error) throw aErrorUsuario(error);
  return (data ?? []).map((f) => ({
    insumo_id: f.insumo_id,
    nombre: f.nombre,
    unidad_medida: f.unidad_medida,
    consumido: numeroValido(f.consumido, "consumido"),
    merma: numeroValido(f.merma, "merma"),
  }));
}
