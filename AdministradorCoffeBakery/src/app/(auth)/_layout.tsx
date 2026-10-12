import { Redirect, Stack } from "expo-router";
import { PantallaCarga } from "@/components/PantallaCarga";
import { useAuthStore } from "@/features/auth/authStore";

export default function AuthLayout() {
  const session = useAuthStore((estado) => estado.session);
  const cargando = useAuthStore((estado) => estado.cargando);

  if (cargando) return <PantallaCarga />;
  if (session) return <Redirect href="/dashboard" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
