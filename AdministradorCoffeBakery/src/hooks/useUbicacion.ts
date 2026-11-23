import * as Location from "expo-location";
import { AppState } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";

export interface Posicion {
  lat: number;
  lng: number;
}

export type EstadoPermiso = "cargando" | "concedido" | "denegado";

// CU-04 / CA-10: permiso «en uso»; si se deniega la app sigue funcionando sin distancias
export function useUbicacion() {
  const [permiso, setPermiso] = useState<EstadoPermiso>("cargando");
  // false cuando el sistema ya no vuelve a mostrar el diálogo («No volver a preguntar»): solo Ajustes lo activa
  const [puedePreguntar, setPuedePreguntar] = useState(true);
  const [posicion, setPosicion] = useState<Posicion | null>(null);
  const ocupado = useRef(false);

  const obtenerPosicion = useCallback(async () => {
    const actual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setPosicion({ lat: actual.coords.latitude, lng: actual.coords.longitude });
  }, []);

  const solicitar = useCallback(async () => {
    if (ocupado.current) return;
    ocupado.current = true;
    try {
      const respuesta = await Location.requestForegroundPermissionsAsync();
      setPuedePreguntar(respuesta.canAskAgain !== false);
      if (respuesta.status !== "granted") {
        setPermiso("denegado");
        setPosicion(null);
        return;
      }
      setPermiso("concedido");
      await obtenerPosicion();
    } catch (error) {
      console.warn("No se pudo obtener la ubicación:", error);
      setPermiso((p) => (p === "concedido" ? p : "denegado"));
    } finally {
      ocupado.current = false;
    }
  }, [obtenerPosicion]);

  useEffect(() => {
    // Sincroniza con un sistema externo (permiso del SO) al montar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void solicitar();
  }, [solicitar]);

  // Si la persona activa el permiso en Ajustes y regresa a la app, se detecta sin tener que reiniciar
  useEffect(() => {
    const suscripcion = AppState.addEventListener("change", (estado) => {
      if (estado !== "active") return;
      void (async () => {
        try {
          const actual = await Location.getForegroundPermissionsAsync();
          setPuedePreguntar(actual.canAskAgain !== false);
          if (actual.granted) {
            setPermiso("concedido");
            await obtenerPosicion();
          } else {
            setPermiso((p) => (p === "cargando" ? p : "denegado"));
          }
        } catch {
          // sin cambios
        }
      })();
    });
    return () => suscripcion.remove();
  }, [obtenerPosicion]);

  return { permiso, puedePreguntar, posicion, solicitar };
}

// La clave de caché se redondea (~1 km) para no recalcular por pequeños movimientos
export function redondearPosicion(valor: number): number {
  return Math.round(valor * 100) / 100;
}
