import { Button } from "react-native";
import { useAuthStore } from "@/features/auth/authStore";
import { ErrorState } from "@/components/ErrorState";

export function ErrorPerfil() {
  const cargarPerfil = useAuthStore((estado) => estado.cargarPerfil);
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);
  const session = useAuthStore((estado) => estado.session);

  return (
    <ErrorState
      message="No se pudo cargar tu perfil"
      onRetry={() => {
        if (session) void cargarPerfil(session.user.id);
      }}
    >
      <Button title="Cerrar sesión" onPress={() => void cerrarSesion()} />
    </ErrorState>
  );
}
