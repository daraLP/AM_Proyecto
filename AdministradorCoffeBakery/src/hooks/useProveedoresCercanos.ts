import { useQuery } from "@tanstack/react-query";
import { listarProveedores, proveedoresCercanos } from "../services/proveedores";
import type { ProveedorCercano } from "../types/database";
import { redondearPosicion, type Posicion } from "./useUbicacion";

// Con posición: RPC proveedores_cercanos (ordenados por distancia).
// Sin posición (permiso denegado): todos los proveedores con coordenadas, sin distancia (RN-13).
export function useProveedoresCercanos(posicion: Posicion | null, insumoId?: string | null) {
  return useQuery<ProveedorCercano[]>({
    queryKey: [
      "proveedores-cercanos",
      posicion ? redondearPosicion(posicion.lat) : null,
      posicion ? redondearPosicion(posicion.lng) : null,
      insumoId ?? null,
    ],
    queryFn: async () => {
      if (posicion) {
        return proveedoresCercanos({ lat: posicion.lat, lng: posicion.lng, insumoId });
      }
      const todos = await listarProveedores();
      return todos
        .filter((p) => p.latitud !== null && p.longitud !== null)
        .map((p) => ({
          id: p.id,
          nombre: p.nombre,
          telefono: p.telefono,
          direccion: p.direccion,
          latitud: p.latitud as number,
          longitud: p.longitud as number,
          distancia_m: null,
        }));
    },
  });
}
