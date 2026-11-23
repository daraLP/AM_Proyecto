import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { Boton } from "@/components/Boton";
import { useToast } from "@/providers/FeedbackProvider";
import { buscarDireccion, direccionDeCoordenada, type Coordenada } from "@/services/geocodificacion";
import { theme } from "@/theme/theme";
import { mensajeDeError } from "@/utils/errores";
import { LIMITES } from "@/utils/validacion";

interface SelectorUbicacionProps {
  direccion: string;
  onDireccionChange: (texto: string) => void;
  valor: Coordenada | null;
  onChange: (coordenada: Coordenada | null) => void;
  /** Avisa cuando la persona toca el mapa, para que la pantalla no haga scroll a la vez. */
  onInteraccion?: (activa: boolean) => void;
}

const REGION_INICIAL: Region = { latitude: 23.6345, longitude: -102.5528, latitudeDelta: 18, longitudeDelta: 18 };
const ZOOM_CERCA = 0.008;

function regionEn(c: Coordenada, delta = ZOOM_CERCA): Region {
  return { latitude: c.lat, longitude: c.lng, latitudeDelta: delta, longitudeDelta: delta };
}

// Dirección escrita o pin movible en el mapa: lo que se quiera, el otro se actualiza solo
export function SelectorUbicacion({
  direccion,
  onDireccionChange,
  valor,
  onChange,
  onInteraccion,
}: SelectorUbicacionProps) {
  const toast = useToast();
  const mapa = useRef<MapView>(null);
  const [buscando, setBuscando] = useState(false);
  const [ubicando, setUbicando] = useState(false);
  // Si la dirección vino del mapa (no la escribió la persona), puede reemplazarse al mover el pin
  const direccionAutomatica = useRef(false);

  const enfocar = useCallback((c: Coordenada) => {
    mapa.current?.animateToRegion(regionEn(c), 450);
  }, []);

  // Al abrir sin ubicación: centra en la última posición conocida, sin pedir permisos
  useEffect(() => {
    if (valor) return;
    let activo = true;
    void (async () => {
      try {
        const permiso = await Location.getForegroundPermissionsAsync();
        if (!permiso.granted) return;
        const ultima = await Location.getLastKnownPositionAsync();
        if (ultima && activo) enfocar({ lat: ultima.coords.latitude, lng: ultima.coords.longitude });
      } catch {
        // sin posición previa: se queda el mapa general
      }
    })();
    return () => {
      activo = false;
    };
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colocar = useCallback(
    async (c: Coordenada) => {
      onChange(c);
      const sugerida = await direccionDeCoordenada(c);
      if (sugerida && (direccion.trim().length === 0 || direccionAutomatica.current)) {
        direccionAutomatica.current = true;
        onDireccionChange(sugerida);
      }
    },
    [direccion, onChange, onDireccionChange],
  );

  const buscar = async () => {
    setBuscando(true);
    try {
      const c = await buscarDireccion(direccion);
      onChange(c);
      enfocar(c);
      toast.exito("Dirección encontrada", "Ajusta el pin si no cae justo en el lugar.");
    } catch (e) {
      toast.aviso("No pudimos ubicar la dirección", mensajeDeError(e));
    } finally {
      setBuscando(false);
    }
  };

  const usarMiUbicacion = async () => {
    setUbicando(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        toast.aviso("Sin permiso de ubicación", "Actívalo en Ajustes, o busca la dirección o toca el mapa.");
        return;
      }
      const actual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const c = { lat: actual.coords.latitude, lng: actual.coords.longitude };
      enfocar(c);
      await colocar(c);
    } catch (e) {
      toast.error("No pudimos obtener tu ubicación", mensajeDeError(e, "Inténtalo de nuevo o toca el mapa."));
    } finally {
      setUbicando(false);
    }
  };

  const quitar = () => {
    onChange(null);
    direccionAutomatica.current = false;
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>Dirección</Text>
      <TextInput
        accessibilityLabel="Dirección"
        value={direccion}
        onChangeText={(t) => {
          direccionAutomatica.current = false; // lo escrito a mano manda
          onDireccionChange(t);
        }}
        placeholder="Calle, número y ciudad"
        maxLength={LIMITES.direccion}
        placeholderTextColor={theme.colors.textMuted}
        returnKeyType="search"
        onSubmitEditing={() => void buscar()}
        style={styles.input}
      />
      <Boton
        titulo="Buscar en el mapa"
        variante="secundario"
        onPress={() => void buscar()}
        cargando={buscando}
        disabled={direccion.trim().length < 4}
      />

      <View
        style={styles.mapaCaja}
        // Mientras se toca el mapa, la pantalla no debe desplazarse (Android)
        onTouchStart={() => onInteraccion?.(true)}
        onTouchEnd={() => onInteraccion?.(false)}
        onTouchCancel={() => onInteraccion?.(false)}
      >
        <MapView
          ref={mapa}
          style={StyleSheet.absoluteFill}
          initialRegion={valor ? regionEn(valor) : REGION_INICIAL}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            void colocar({ lat: latitude, lng: longitude });
          }}
          showsUserLocation
          toolbarEnabled={false}
        >
          {valor ? (
            <Marker
              coordinate={{ latitude: valor.lat, longitude: valor.lng }}
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                void colocar({ lat: latitude, lng: longitude });
              }}
            />
          ) : null}
        </MapView>
        {!valor ? (
          <View pointerEvents="none" style={styles.sugerencia}>
            <Text style={styles.sugerenciaTexto}>Toca el mapa para colocar el pin</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.ayuda}>
        {valor
          ? `Ubicación: ${valor.lat.toFixed(5)}, ${valor.lng.toFixed(5)}. Mantén pulsado el pin y arrástralo para afinarla.`
          : "Sin ubicación, el proveedor no aparece en el mapa de Compras."}
      </Text>

      <View style={styles.fila}>
        <View style={styles.flex}>
          <Boton titulo="Usar mi ubicación" variante="secundario" onPress={() => void usarMiUbicacion()} cargando={ubicando} />
        </View>
        {valor ? (
          <View style={styles.flex}>
            <Boton titulo="Quitar pin" variante="peligro" onPress={quitar} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: theme.spacing.sm },
  etiqueta: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, fontWeight: "700" },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  mapaCaja: { borderColor: theme.colors.border, borderRadius: theme.borderRadius.lg, borderWidth: 1, height: 260, overflow: "hidden" },
  sugerencia: { alignItems: "center", bottom: theme.spacing.sm, left: 0, position: "absolute", right: 0 },
  sugerenciaTexto: {
    backgroundColor: "rgba(30, 39, 44, 0.78)",
    borderRadius: theme.borderRadius.pill,
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
  },
  ayuda: { color: theme.colors.textMuted, fontSize: theme.fontSize.xs },
  fila: { flexDirection: "row", gap: theme.spacing.sm },
  flex: { flex: 1 },
});
