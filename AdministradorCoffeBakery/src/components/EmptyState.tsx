import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme/theme";

interface EmptyStateProps {
  title: string;
  message?: string;
  icono?: ComponentProps<typeof Ionicons>["name"];
}

export function EmptyState({ title, message, icono = "file-tray-outline" }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icono}>
        <Ionicons name={icono} size={32} color={theme.colors.primaryDark} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: theme.spacing.xs, justifyContent: "center", padding: theme.spacing.xl },
  icono: { alignItems: "center", backgroundColor: theme.colors.primaryLight, borderRadius: theme.borderRadius.pill, height: 68, justifyContent: "center", marginBottom: theme.spacing.xs, width: 68 },
  title: { color: theme.colors.textPrimary, fontSize: theme.fontSize.lg, fontWeight: "800", textAlign: "center" },
  message: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, lineHeight: 20, maxWidth: 300, textAlign: "center" },
});
