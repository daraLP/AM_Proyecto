import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme/theme";
import { MOTIVOS, type Motivo } from "@/types/database";

interface ReasonChipsProps {
  value: Motivo | null;
  onChange: (motivo: Motivo) => void;
  disabled?: boolean;
}

// Selección única entre los 5 motivos que acepta el CHECK de la BD (ADR-04)
export function ReasonChips({ value, onChange, disabled = false }: ReasonChipsProps) {
  return (
    <View style={styles.contenedor} accessibilityRole="radiogroup">
      {MOTIVOS.map((motivo) => {
        const activo = value === motivo;
        return (
          <Pressable
            key={motivo}
            accessibilityRole="radio"
            accessibilityState={{ selected: activo, disabled }}
            disabled={disabled}
            onPress={() => onChange(motivo)}
            style={[styles.chip, activo && styles.chipActivo, disabled && styles.deshabilitado]}
          >
            <Text style={[styles.texto, activo && styles.textoActivo]}>{motivo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  chip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
  },
  chipActivo: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primaryDark },
  texto: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, fontWeight: "600" },
  textoActivo: { color: theme.colors.white },
  deshabilitado: { opacity: 0.5 },
});
