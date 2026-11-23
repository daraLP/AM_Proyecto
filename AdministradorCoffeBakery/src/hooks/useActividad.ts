import { useQuery } from "@tanstack/react-query";
import { listarActividad } from "../services/movimientos";

export function useActividad(limite = 50) {
  return useQuery({ queryKey: ["actividad", limite], queryFn: () => listarActividad(limite) });
}
