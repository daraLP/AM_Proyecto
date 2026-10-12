import { Button, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "@/features/auth/authStore";

export function ErrorPerfil() {
  const cargarPerfil = useAuthStore((estado) => estado.cargarPerfil);
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);
  const session = useAuthStore((estado) => estado.session);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>No se pudo cargar tu perfil</Text>
      <Button
        title="Reintentar"
        onPress={() => {
          if (session) void cargarPerfil(session.user.id);
        }}
      />
      <Button title="Cerrar sesión" onPress={() => void cerrarSesion()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
  },
});
