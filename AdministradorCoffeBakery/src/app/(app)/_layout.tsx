import { Redirect, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ErrorPerfil } from "@/components/ErrorPerfil";
import { PantallaCarga } from "@/components/PantallaCarga";
import { useAuthStore } from "@/features/auth/authStore";
import { useEstaOnline } from "@/hooks/useEstaOnline";
import { theme } from "@/theme/theme";

export default function AppLayout() {
  const session = useAuthStore((estado) => estado.session);
  const perfil = useAuthStore((estado) => estado.perfil);
  const cargando = useAuthStore((estado) => estado.cargando);
  const estaOnline = useEstaOnline();

  if (cargando) return <PantallaCarga />;
  if (!session) return <Redirect href="/login" />;
  if (!perfil) return <ErrorPerfil />;

  return (
    <View style={styles.container}>
      {!estaOnline && <Text style={styles.offline}>Sin conexión</Text>}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="movimiento-modal"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Registrar movimiento",
          }}
        />
        <Stack.Screen
          name="scan-modal"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Foto del insumo",
          }}
        />
        <Stack.Screen
          name="confirmar-compra-modal"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Confirmar compra",
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  offline: {
    backgroundColor: theme.colors.warning,
    color: theme.colors.textPrimary,
    padding: theme.spacing.xs,
    textAlign: "center",
  },
});
