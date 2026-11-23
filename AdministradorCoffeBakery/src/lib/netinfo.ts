import NetInfo from "@react-native-community/netinfo";

// La app solo necesita saber si ALCANZA a Supabase, no si Google responde (valor por defecto de
// NetInfo, que da falsos «sin conexión» en algunas redes). Cualquier respuesta < 500 cuenta como alcanzable
// (el endpoint de salud contesta 200/401 según haya apikey).
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;

NetInfo.configure({
  reachabilityUrl: url ? `${url}/auth/v1/health` : "https://clients3.google.com/generate_204",
  reachabilityTest: async (respuesta) => respuesta.status < 500,
  reachabilityMethod: "GET",
  reachabilityLongTimeout: 60 * 1000,
  reachabilityShortTimeout: 5 * 1000,
  reachabilityRequestTimeout: 15 * 1000,
  useNativeReachability: false,
});
