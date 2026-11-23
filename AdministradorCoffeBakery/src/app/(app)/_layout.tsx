import { Redirect, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorPerfil } from "@/components/ErrorPerfil";
import { PantallaCarga } from "@/components/PantallaCarga";
import { useAuthStore } from "@/features/auth/authStore";
import { useEstaOnline } from "@/hooks/useEstaOnline";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useRealtimeInvalidacion } from "@/hooks/useRealtime";
import { theme } from "@/theme/theme";

export default function AppLayout() {
  const session = useAuthStore((estado) => estado.session);
  const perfil = useAuthStore((estado) => estado.perfil);
  const cargando = useAuthStore((estado) => estado.cargando);
  const estaOnline = useEstaOnline();
  const insets = useSafeAreaInsets();

  // Hooks antes de cualquier return condicional. Solo actúan con sesión activa.
  usePushNotifications(session?.user.id);
  useRealtimeInvalidacion(Boolean(session));

  if (cargando) return <PantallaCarga />;
  if (!session) return <Redirect href="/login" />;
  if (!perfil) return <ErrorPerfil />;

  return (
    <View style={styles.container}>
      {/* Superpuesto sobre la barra de pestañas: no desplaza el encabezado ni el contenido */}
      {!estaOnline && (
        <View
          pointerEvents="none"
          accessibilityRole="alert"
          style={[styles.offlineContenedor, { bottom: insets.bottom + (Platform.OS === "ios" ? 49 : 56) + 8 }]}
        >
          <View style={styles.offline}>
            <Ionicons name="cloud-offline" size={16} color={theme.colors.white} />
            <Text style={styles.offlineTexto}>Sin conexión · tus cambios se enviarán al reconectar</Text>
          </View>
        </View>
      )}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="movimiento-modal"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="scan-modal"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="confirmar-compra-modal"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  offlineContenedor: { alignItems: "center", left: 0, position: "absolute", right: 0, zIndex: 10 },
  offline: {
    alignItems: "center",
    backgroundColor: theme.colors.warningDark,
    borderRadius: theme.borderRadius.pill,
    elevation: 6,
    flexDirection: "row",
    gap: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  offlineTexto: { color: theme.colors.white, fontSize: theme.fontSize.xs, fontWeight: "700" },
});
