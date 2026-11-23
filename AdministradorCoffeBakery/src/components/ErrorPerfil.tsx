import { Boton } from "@/components/Boton";
import { ErrorState } from "@/components/ErrorState";
import { useAuthStore } from "@/features/auth/authStore";

export function ErrorPerfil() {
  const cargarPerfil = useAuthStore((estado) => estado.cargarPerfil);
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);
  const session = useAuthStore((estado) => estado.session);

  return (
    <ErrorState
      title="No pudimos cargar tu perfil"
      message="Reintenta; si sigue igual, cierra sesión y vuelve a entrar. Si el problema continúa, avísale a un administrador."
      onRetry={() => {
        if (session) void cargarPerfil(session.user.id);
      }}
    >
      <Boton titulo="Cerrar sesión" variante="secundario" onPress={() => void cerrarSesion()} />
    </ErrorState>
  );
}
