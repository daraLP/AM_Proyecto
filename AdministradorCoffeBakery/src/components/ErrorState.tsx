import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Boton } from "@/components/Boton";
import { ESTILOS_AVISO } from "@/components/feedback/tipos";
import { theme } from "@/theme/theme";

interface ErrorStateProps {
  message?: string;
  title?: string;
  onRetry: () => void;
  children?: ReactNode;
}

export function ErrorState({
  title = "Algo no salió bien",
  message = "No pudimos cargar la información. Revisa tu conexión y vuelve a intentarlo.",
  onRetry,
  children,
}: ErrorStateProps) {
  const estilo = ESTILOS_AVISO.error;
  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={[styles.icono, { backgroundColor: estilo.fondo }]}>
        <Ionicons name="cloud-offline-outline" size={36} color={estilo.color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.acciones}>
        <Boton titulo="Reintentar" onPress={onRetry} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", flex: 1, gap: theme.spacing.sm, justifyContent: "center", padding: theme.spacing.lg },
  icono: { alignItems: "center", borderRadius: theme.borderRadius.pill, height: 76, justifyContent: "center", marginBottom: theme.spacing.xs, width: 76 },
  title: { color: theme.colors.textPrimary, fontSize: theme.fontSize.lg, fontWeight: "800", textAlign: "center" },
  message: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, lineHeight: 22, maxWidth: 320, textAlign: "center" },
  acciones: { alignSelf: "stretch", gap: theme.spacing.sm, marginTop: theme.spacing.md, maxWidth: 320, width: "100%" },
});
