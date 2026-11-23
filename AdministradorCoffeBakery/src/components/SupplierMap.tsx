import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import type { Posicion } from "@/hooks/useUbicacion";
import type { ProveedorCercano } from "@/types/database";
import { formatearDistancia } from "@/utils/formato";

interface SupplierMapProps {
  proveedores: ProveedorCercano[];
  posicion: Posicion | null;
  onSeleccionar: (proveedorId: string) => void;
}

// Centro por defecto (México) cuando no hay posición ni proveedores con coordenadas
const REGION_POR_DEFECTO: Region = { latitude: 23.6345, longitude: -102.5528, latitudeDelta: 20, longitudeDelta: 20 };

function calcularRegion(proveedores: ProveedorCercano[], posicion: Posicion | null): Region {
  const puntos = proveedores.map((p) => ({ lat: p.latitud, lng: p.longitud }));
  if (posicion) puntos.push(posicion);
  if (puntos.length === 0) return REGION_POR_DEFECTO;

  const lats = puntos.map((p) => p.lat);
  const lngs = puntos.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.02),
  };
}

export function SupplierMap({ proveedores, posicion, onSeleccionar }: SupplierMapProps) {
  const region = useMemo(() => calcularRegion(proveedores, posicion), [proveedores, posicion]);

  return (
    <View style={styles.contenedor}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        region={region}
        showsUserLocation={posicion !== null}
        showsMyLocationButton={posicion !== null}
        toolbarEnabled={false}
      >
        {proveedores.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitud, longitude: p.longitud }}
            title={p.nombre}
            description={p.distancia_m !== null ? formatearDistancia(p.distancia_m) : p.direccion ?? undefined}
            onCalloutPress={() => onSeleccionar(p.id)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { height: "100%", overflow: "hidden", width: "100%" },
});
