import { useRef } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { theme } from "@/theme/theme";
import { crearBloqueo } from "@/utils/envioUnico";

interface BotonProps {
  titulo: string;
  onPress: () => void;
  variante?: "primario" | "secundario" | "peligro";
  cargando?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function Boton({
  titulo,
  onPress,
  variante = "primario",
  cargando = false,
  disabled = false,
  accessibilityLabel,
}: BotonProps) {
  const inactivo = disabled || cargando;
  // Dos toques seguidos (antes de que React pinte «cargando») ejecutan la acción una sola vez
  const bloqueo = useRef(crearBloqueo()).current;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      disabled={inactivo}
      onPress={() => {
        bloqueo.ejecutar(onPress);
      }}
      style={({ pressed }) => [
        styles.base,
        variante === "primario" && styles.primario,
        variante === "secundario" && styles.secundario,
        variante === "peligro" && styles.peligro,
        inactivo && styles.inactivo,
        pressed && styles.presionado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={variante === "primario" ? theme.colors.white : theme.colors.textPrimary} />
      ) : (
        <Text
          style={[
            styles.texto,
            variante === "primario" && styles.textoPrimario,
            variante === "peligro" && styles.textoPeligro,
          ]}
        >
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: theme.spacing.md,
  },
  primario: { backgroundColor: theme.colors.primary },
  secundario: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 },
  peligro: { backgroundColor: theme.colors.errorLight },
  inactivo: { backgroundColor: theme.colors.disabled, opacity: 0.8 },
  presionado: { opacity: 0.75 },
  texto: { color: theme.colors.textPrimary, fontSize: theme.fontSize.md, fontWeight: "700" },
  textoPrimario: { color: theme.colors.white },
  textoPeligro: { color: theme.colors.error },
});
