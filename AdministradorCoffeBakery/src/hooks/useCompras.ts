import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { agregarCompraManual, comprarItem, listarCompras, obtenerItemCompra } from "../services/compras";

export function useCompras() {
  return useQuery({ queryKey: ["compras"], queryFn: listarCompras });
}

export function useItemCompra(id: string | undefined) {
  return useQuery({
    queryKey: ["compras", "item", id],
    enabled: Boolean(id),
    queryFn: () => obtenerItemCompra(id as string),
  });
}

function useInvalidarTrasCompra() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["compras"] });
    void queryClient.invalidateQueries({ queryKey: ["insumos"] });
    void queryClient.invalidateQueries({ queryKey: ["insumo"] });
    void queryClient.invalidateQueries({ queryKey: ["movimientos"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useComprarItem() {
  const invalidar = useInvalidarTrasCompra();
  return useMutation({ mutationFn: comprarItem, onSettled: invalidar });
}

export function useAgregarCompraManual() {
  const invalidar = useInvalidarTrasCompra();
  return useMutation({ mutationFn: agregarCompraManual, onSettled: invalidar });
}
