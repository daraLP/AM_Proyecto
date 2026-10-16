import type { ReactNode } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme/theme";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  children?: ReactNode;
}

export function ErrorState({
  message = "No se pudo cargar la información.",
  onRetry,
  children,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <Button title="Reintentar" onPress={onRetry} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  message: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    textAlign: "center",
  },
});
