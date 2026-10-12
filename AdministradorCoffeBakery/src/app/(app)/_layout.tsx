import { Redirect, Stack } from "expo-router";
import { ErrorPerfil } from "@/components/ErrorPerfil";
import { PantallaCarga } from "@/components/PantallaCarga";
import { useAuthStore } from "@/features/auth/authStore";

export default function AppLayout() {
  const session = useAuthStore((estado) => estado.session);
  const perfil = useAuthStore((estado) => estado.perfil);
  const cargando = useAuthStore((estado) => estado.cargando);

  if (cargando) return <PantallaCarga />;
  if (!session) return <Redirect href="/login" />;
  if (!perfil) return <ErrorPerfil />;

  return (
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
  );
}
