import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ESTILOS_AVISO, type TipoAviso } from "@/components/feedback/tipos";
import { theme } from "@/theme/theme";

interface AvisoProps {
  tipo?: TipoAviso;
  mensaje: string;
  titulo?: string;
}

// Aviso en línea (dentro de formularios y modales): misma identidad visual que el toast
export function Aviso({ tipo = "error", mensaje, titulo }: AvisoProps) {
  const estilo = ESTILOS_AVISO[tipo];
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.contenedor, { backgroundColor: estilo.fondo, borderLeftColor: estilo.color }]}
    >
      <Ionicons name={estilo.icono} size={22} color={estilo.color} />
      <View style={styles.texto}>
        {titulo ? <Text style={styles.titulo}>{titulo}</Text> : null}
        <Text style={styles.mensaje}>{mensaje}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  texto: { flex: 1, gap: 2 },
  titulo: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, fontWeight: "800" },
  mensaje: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, lineHeight: 20 },
});
