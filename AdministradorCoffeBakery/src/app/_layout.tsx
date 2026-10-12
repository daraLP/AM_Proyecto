import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/authStore";

const queryClient = new QueryClient();

export default function RootLayout() {
  const inicializar = useAuthStore((estado) => estado.inicializar);

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
