import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// DEV-25: un cambio en insumos o lista_compras (de cualquier usuario) refresca las consultas
export function useRealtimeInvalidacion(activo = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!activo) return;
    const canal = supabase
      .channel("poscafe-cambios")
      .on("postgres_changes", { event: "*", schema: "public", table: "insumos" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["insumos"] });
        void queryClient.invalidateQueries({ queryKey: ["insumo"] });
        void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "movimientos_inventario" }, () => {
        // Lo que registra otro perfil aparece al instante en historial y actividad
        void queryClient.invalidateQueries({ queryKey: ["movimientos"] });
        void queryClient.invalidateQueries({ queryKey: ["actividad"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "lista_compras" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["compras"] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(canal);
    };
  }, [queryClient, activo]);
}
