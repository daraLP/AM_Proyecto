import { Slot } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/authStore";
import { AppProviders } from "@/providers/AppProviders";

export default function RootLayout() {
  const inicializar = useAuthStore((estado) => estado.inicializar);

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
