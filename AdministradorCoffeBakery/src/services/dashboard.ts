import { supabase } from "../lib/supabaseClient";
import { traducirError } from "./movimientos";

export interface ResumenDashboard {
  total: number;
  bajo: number;
  agotado: number;
}

export interface ConsumoSemanal {
  dia: string;
  salidas: number;
}

function numeroValido(valor: unknown, campo: string): number {
  const numero = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(numero)) {
    throw new Error(`La respuesta de Dashboard contiene ${campo} inválido.`);
  }
  return numero;
}

export async function obtenerResumenDashboard(): Promise<ResumenDashboard> {
  const { data, error } = await supabase.rpc("resumen_dashboard");
  if (error) throw new Error(traducirError(error));

  const fila = Array.isArray(data) ? data[0] : data;
  if (!fila || typeof fila !== "object") {
    throw new Error("La respuesta del resumen de Dashboard no es válida.");
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
  if (error) throw new Error(traducirError(error));
  if (!Array.isArray(data)) {
    throw new Error("La respuesta del consumo semanal no es válida.");
  }

  return data.map((fila) => {
    if (!fila || typeof fila !== "object") {
      throw new Error(
        "La respuesta del consumo semanal contiene datos inválidos.",
      );
    }
    const registro = fila as Record<string, unknown>;
    if (typeof registro.dia !== "string") {
      throw new Error(
        "La respuesta del consumo semanal contiene un día inválido.",
      );
    }
    return {
      dia: registro.dia,
      salidas: numeroValido(registro.salidas, "salidas"),
    };
  });
}
