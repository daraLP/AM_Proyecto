import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  obtenerConsumoSemanal,
  obtenerResumenDashboard,
} from "../services/dashboard";

const resumenKey = ["dashboard", "resumen"] as const;
const consumoKey = ["dashboard", "consumo"] as const;

export function useDashboard() {
  const queryClient = useQueryClient();
  const resumenQuery = useQuery({
    queryKey: resumenKey,
    queryFn: obtenerResumenDashboard,
    refetchInterval: 60_000,
  });
  const consumoQuery = useQuery({
    queryKey: consumoKey,
    queryFn: () => obtenerConsumoSemanal(7),
    refetchInterval: 60_000,
  });

  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }, [queryClient]),
  );

  const refrescar = useCallback(async () => {
    await Promise.all([resumenQuery.refetch(), consumoQuery.refetch()]);
  }, [consumoQuery, resumenQuery]);

  return {
    resumen: resumenQuery.data,
    consumo: consumoQuery.data ?? [],
    cargando: resumenQuery.isLoading || consumoQuery.isLoading,
    actualizando:
      resumenQuery.isFetching || consumoQuery.isFetching,
    error: resumenQuery.error ?? consumoQuery.error ?? null,
    refrescar,
  };
}
