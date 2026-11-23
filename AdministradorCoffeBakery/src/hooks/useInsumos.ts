import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  TAMANO_PAGINA,
  listarInsumosPaginado,
  obtenerInsumo,
  type FiltrosInsumos,
} from "../services/insumos";
import { ErrorUsuario } from "../utils/errores";

export function useInsumos(filtros: FiltrosInsumos) {
  return useInfiniteQuery({
    queryKey: ["insumos", filtros],
    queryFn: ({ pageParam }) => listarInsumosPaginado(pageParam, filtros),
    initialPageParam: 0,
    getNextPageParam: (ultima, todas) =>
      ultima.length === TAMANO_PAGINA ? todas.length : undefined,
  });
}

// ADR-06: las pantallas reciben solo el id y consultan (con caché) el insumo
export function useInsumo(id: string | undefined) {
  return useQuery({
    queryKey: ["insumo", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await obtenerInsumo(id as string);
      if (error) throw new ErrorUsuario(error);
      return data;
    },
  });
}
