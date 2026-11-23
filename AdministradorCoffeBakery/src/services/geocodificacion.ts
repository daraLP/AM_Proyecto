import * as Location from "expo-location";
import { ErrorUsuario } from "../utils/errores";

export interface Coordenada {
  lat: number;
  lng: number;
}

// Arma «Calle 123, Colonia, Ciudad, Estado» sin repetir partes ni dejar huecos
export function formatearDireccion(a: Location.LocationGeocodedAddress): string {
  const calle = [a.street ?? a.name, a.streetNumber].filter(Boolean).join(" ").trim();
  const partes = [calle, a.district, a.city ?? a.subregion, a.region]
    .map((p) => (p ?? "").trim())
    .filter((p) => p.length > 0);
  const vistas = new Set<string>();
  return partes.filter((p) => (vistas.has(p.toLowerCase()) ? false : (vistas.add(p.toLowerCase()), true))).join(", ");
}

// Dirección escrita → coordenada. Usa el geocodificador del sistema (Apple / Google en el teléfono).
export async function buscarDireccion(texto: string): Promise<Coordenada> {
  const consulta = texto.trim();
  if (consulta.length < 4) {
    throw new ErrorUsuario("Escribe la dirección completa (calle, número y ciudad) para buscarla.");
  }

  let resultados: Location.LocationGeocodedLocation[];
  try {
    resultados = await Location.geocodeAsync(consulta);
  } catch {
    throw new ErrorUsuario(
      "No pudimos buscar la dirección ahora. Revisa tu conexión o coloca el pin a mano en el mapa.",
    );
  }

  const primero = resultados[0];
  if (!primero) {
    throw new ErrorUsuario("No encontramos esa dirección. Agrega la ciudad o coloca el pin a mano en el mapa.");
  }
  return { lat: primero.latitude, lng: primero.longitude };
}

// Coordenada → dirección legible. Nunca lanza: si falla, simplemente no hay sugerencia.
export async function direccionDeCoordenada(c: Coordenada): Promise<string | null> {
  try {
    const [primera] = await Location.reverseGeocodeAsync({ latitude: c.lat, longitude: c.lng });
    if (!primera) return null;
    const texto = formatearDireccion(primera);
    return texto.length > 0 ? texto : null;
  } catch {
    return null;
  }
}
