import { memo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { StockBadge } from "@/components/StockBadge";
import { theme } from "@/theme/theme";
import type { Insumo } from "@/types/database";
import { formatearCantidad } from "@/utils/formato";

interface InsumoCardProps {
  insumo: Insumo;
  onPress: (id: string) => void;
}

// Memoizada (RDV-04): la lista re-renderiza solo las filas cuyo insumo cambió
function InsumoCardBase({ insumo, onPress }: InsumoCardProps) {
  const alerta = insumo.estado_stock !== "ok";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${insumo.nombre}, ${formatearCantidad(insumo.stock_actual)} ${insumo.unidad_medida}`}
      onPress={() => onPress(insumo.id)}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}
    >
      {insumo.foto_url ? (
        <Image source={{ uri: insumo.foto_url }} style={styles.foto} />
      ) : (
        <View style={[styles.foto, styles.fotoVacia]}>
          <Text style={styles.inicial}>{insumo.nombre.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.cuerpo}>
        <View style={styles.encabezado}>
          <Text style={styles.nombre} numberOfLines={1}>
            {insumo.nombre}
          </Text>
          {alerta && <StockBadge estado={insumo.estado_stock} />}
        </View>
        <Text style={styles.detalle}>
          Stock:{" "}
          <Text style={[styles.valor, alerta && styles.valorAlerta]}>
            {formatearCantidad(insumo.stock_actual)} {insumo.unidad_medida}
          </Text>{" "}
          (Mín: {formatearCantidad(insumo.stock_minimo)})
        </Text>
      </View>
    </Pressable>
  );
}

export const InsumoCard = memo(InsumoCardBase);

const styles = StyleSheet.create({
  tarjeta: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: 72,
    padding: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  presionada: { opacity: 0.7 },
  foto: { borderRadius: theme.borderRadius.md, height: 56, width: 56 },
  fotoVacia: { alignItems: "center", backgroundColor: theme.colors.primaryLight, justifyContent: "center" },
  inicial: { color: theme.colors.primaryDark, fontSize: theme.fontSize.lg, fontWeight: "700" },
  cuerpo: { flex: 1, gap: 4 },
  encabezado: { alignItems: "center", flexDirection: "row", gap: theme.spacing.sm, justifyContent: "space-between" },
  nombre: { color: theme.colors.textPrimary, flexShrink: 1, fontSize: theme.fontSize.md, fontWeight: "700" },
  detalle: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  valor: { color: theme.colors.textPrimary, fontWeight: "700" },
  valorAlerta: { color: theme.colors.error },
});
