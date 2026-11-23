import AsyncStorage from "@react-native-async-storage/async-storage";
import "./netinfo";
import NetInfo from "@react-native-community/netinfo";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { registrarMovimiento } from "../services/movimientos";
import type { Motivo } from "../types/database";
import { ErrorUsuario } from "../utils/errores";

export const QUERY_CACHE_BUSTER = "hito-3-v1";
export const QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: QUERY_CACHE_MAX_AGE,
      // Modo avión: se muestra lo guardado en caché; si no hay caché, la consulta falla y sale el
      // aviso «Reintentar» en lugar de quedarse cargando para siempre (el modo por defecto la pausa).
      networkMode: "offlineFirst",
      retry: 1,
    },
    mutations: {
      // Sin conexión, las acciones normales (crear insumo, comprar, categorías…) fallan al instante con el
      // aviso «No hay conexión a internet» en vez de quedar pausadas con el botón girando indefinidamente.
      // Solo registrar movimientos se encola a propósito (ver abajo).
      networkMode: "always",
    },
  },
});

export const MUTATION_REGISTRAR_MOVIMIENTO = ["registrar-movimiento"] as const;

export interface VariablesMovimiento {
  insumoId: string;
  delta: number;
  motivo: Motivo;
  nota?: string;
  opId: string; // client_op_id: idempotencia ante reintentos y reenvíos offline
}

// La función vive aquí (no en el hook) para que una mutación pausada y restaurada tras
// reiniciar la app pueda reanudarse: solo las variables se serializan, la función no.
queryClient.setMutationDefaults(MUTATION_REGISTRAR_MOVIMIENTO, {
  mutationFn: async (variables: VariablesMovimiento) => {
    const { data, error, codigo } = await registrarMovimiento(variables);
    if (error || !data)
      throw new ErrorUsuario(error ?? "No pudimos registrar el movimiento. Inténtalo de nuevo.", codigo);
    return data;
  },
  // Cola sin conexión: se pausa y se reenvía al reconectar (RNF-02)
  networkMode: "online",
  retry: 2,
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(state.isConnected !== false && state.isInternetReachable !== false);
  }),
);

export async function limpiarCachePersistida(): Promise<void> {
  queryClient.clear();
  await queryPersister.removeClient();
}
