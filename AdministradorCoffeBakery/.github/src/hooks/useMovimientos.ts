import { useMutation, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { MUTATION_REGISTRAR_MOVIMIENTO, type VariablesMovimiento } from "../lib/queryClient";
import { listarMovimientos } from "../services/movimientos";
import type { EstadoStock, Insumo } from "../types/database";
import { stockProyectado } from "../utils/delta";

export function useMovimientos(insumoId: string | undefined, limite = 5) {
  return useQuery({
    queryKey: ["movimientos", insumoId, limite],
    enabled: Boolean(insumoId),
    queryFn: () => listarMovimientos(insumoId as string, limite),
  });
}

// Solo para pintar el resultado esperado mientras llega la respuesta; la BD es la autoridad (RD-02)
function estadoEsperado(stock: number, minimo: number): EstadoStock {
  if (stock <= 0) return "agotado";
  if (stock <= minimo) return "bajo";
  return "ok";
}

function aplicarDelta(insumo: Insumo, delta: number): Insumo {
  const stock = stockProyectado(insumo.stock_actual, delta);
  return { ...insumo, stock_actual: stock, estado_stock: estadoEsperado(stock, insumo.stock_minimo) };
}

export function useRegistrarMovimiento() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, VariablesMovimiento, {
    anterior: Insumo | null | undefined;
    paginas: [readonly unknown[], unknown][];
  }>({
    mutationKey: MUTATION_REGISTRAR_MOVIMIENTO,

    // Actualización optimista (DEV-07): el stock mostrado cambia al instante
    onMutate: async ({ insumoId, delta }) => {
      await queryClient.cancelQueries({ queryKey: ["insumo", insumoId] });
      await queryClient.cancelQueries({ queryKey: ["insumos"] });

      const anterior = queryClient.getQueryData<Insumo | null>(["insumo", insumoId]);
      if (anterior) queryClient.setQueryData(["insumo", insumoId], aplicarDelta(anterior, delta));

      const paginas = queryClient.getQueriesData<InfiniteData<Insumo[]>>({ queryKey: ["insumos"] });
      for (const [clave, datos] of paginas) {
        if (!datos) continue;
        queryClient.setQueryData<InfiniteData<Insumo[]>>(clave, {
          ...datos,
          pages: datos.pages.map((pagina) =>
            pagina.map((i) => (i.id === insumoId ? aplicarDelta(i, delta) : i)),
          ),
        });
      }
      return { anterior, paginas: paginas as [readonly unknown[], unknown][] };
    },

    // Rollback: un error revierte el stock mostrado
    onError: (_error, { insumoId }, contexto) => {
      if (!contexto) return;
      queryClient.setQueryData(["insumo", insumoId], contexto.anterior);
      for (const [clave, datos] of contexto.paginas) queryClient.setQueryData(clave, datos);
    },

    onSettled: (_datos, _error, { insumoId }) => {
      void queryClient.invalidateQueries({ queryKey: ["insumo", insumoId] });
      void queryClient.invalidateQueries({ queryKey: ["insumos"] });
      void queryClient.invalidateQueries({ queryKey: ["movimientos", insumoId] });
      void queryClient.invalidateQueries({ queryKey: ["compras"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
