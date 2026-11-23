import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton } from "@/components/Boton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PantallaCarga } from "@/components/PantallaCarga";
import { useAuthStore } from "@/features/auth/authStore";
import { useGestionUsuarios, usePerfiles } from "@/hooks/useCatalogos";
import { theme } from "@/theme/theme";
import type { Perfil } from "@/types/database";
import { mensajeDeError } from "@/utils/errores";
import { useDialogo, useToast } from "@/providers/FeedbackProvider";

// RF-16 (solo administrador): cambiar el rol de los demás usuarios
export function UsuariosScreen() {
  const miId = useAuthStore((s) => s.perfil?.id);
  const perfiles = usePerfiles();
  const { cambiarRol } = useGestionUsuarios();
  const toast = useToast();
  const dialogo = useDialogo();

  if (perfiles.isLoading) return <PantallaCarga />;
  if (perfiles.isError) return <ErrorState message={mensajeDeError(perfiles.error)} onRetry={() => void perfiles.refetch()} />;

  const confirmarCambio = async (p: Perfil) => {
    const nuevoRol = p.rol === "administrador" ? "barista" : "administrador";
    const confirmado = await dialogo.confirmar({
      titulo: "¿Cambiar el rol?",
      mensaje: `«${p.nombre}» pasará de ${p.rol} a ${nuevoRol}.`,
      textoConfirmar: "Cambiar rol",
    });
    if (!confirmado) return;
    cambiarRol.mutate(
      { userId: p.id, rol: nuevoRol },
      {
        onSuccess: () => toast.exito("Rol actualizado", `${p.nombre} ahora es ${nuevoRol}.`),
        onError: (e) => toast.error("No pudimos cambiar el rol", mensajeDeError(e)),
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <FlatList
        data={perfiles.data ?? []}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
        ListEmptyComponent={<EmptyState title="Sin usuarios" />}
        renderItem={({ item }) => {
          const soyYo = item.id === miId;
          return (
            <View style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>
                  {item.nombre}
                  {soyYo ? " (tú)" : ""}
                </Text>
                <Text style={styles.rol}>{item.rol}</Text>
              </View>
              {/* Un administrador no se degrada a sí mismo: evita dejar el sistema sin admin */}
              <Boton
                titulo={item.rol === "administrador" ? "Hacer barista" : "Hacer admin"}
                variante="secundario"
                onPress={() => void confirmarCambio(item)}
                disabled={soyYo || cambiarRol.isPending}
              />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  lista: { padding: theme.spacing.md },
  fila: { alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, flexDirection: "row", gap: theme.spacing.sm, padding: theme.spacing.md },
  nombre: { color: theme.colors.textPrimary, fontSize: theme.fontSize.md, fontWeight: "700" },
  rol: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, textTransform: "capitalize" },
});
