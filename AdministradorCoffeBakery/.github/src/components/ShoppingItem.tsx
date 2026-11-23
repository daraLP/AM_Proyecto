import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme/theme";
import type { ItemCompra } from "@/types/database";
import { formatearCantidad } from "@/utils/formato";

interface ShoppingItemProps {
  item: ItemCompra;
  onMarcar: (itemId: string) => void;
  onAbrirProveedor?: (proveedorId: string) => void;
}

function ShoppingItemBase({ item, onMarcar, onAbrirProveedor }: ShoppingItemProps) {
  const unidad = item.insumos?.unidad_medida ?? "";
  const nombre = item.insumos?.nombre ?? "Insumo";
  return (
    <View style={styles.fila}>
      {/* Checkbox: abre ConfirmarCompraModal (CU-03) */}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: false }}
        accessibilityLabel={`Marcar ${nombre} como comprado`}
        onPress={() => onMarcar(item.id)}
        hitSlop={8}
        style={styles.checkbox}
      >
        <View style={styles.checkboxInterior} />
      </Pressable>

      <View style={styles.cuerpo}>
        <Text style={styles.nombre} numberOfLines={1}>
          {nombre}
        </Text>
        <Text style={styles.detalle}>
          Sugerido: {formatearCantidad(item.cantidad_sugerida)} {unidad}
        </Text>
        {item.proveedores && (
          <Pressable
            accessibilityRole="link"
            onPress={() => item.proveedores && onAbrirProveedor?.(item.proveedores.id)}
            disabled={!onAbrirProveedor}
          >
            <Text style={styles.proveedor}>{item.proveedores.nombre}</Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.origen, item.origen === "auto" ? styles.origenAuto : styles.origenManual]}>
        <Text style={styles.origenTexto}>{item.origen === "auto" ? "AUTO" : "MANUAL"}</Text>
      </View>
    </View>
  );
}

export const ShoppingItem = memo(ShoppingItemBase);

const styles = StyleSheet.create({
  fila: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: 64,
    padding: theme.spacing.md,
  },
  checkbox: {
    alignItems: "center",
    borderColor: theme.colors.primary,
    borderRadius: 8,
    borderWidth: 2,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  checkboxInterior: { height: 0, width: 0 },
  cuerpo: { flex: 1, gap: 2 },
  nombre: { color: theme.colors.textPrimary, fontSize: theme.fontSize.md, fontWeight: "700" },
  detalle: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  proveedor: { color: theme.colors.primaryDark, fontSize: theme.fontSize.sm, fontWeight: "600" },
  origen: { borderRadius: theme.borderRadius.pill, paddingHorizontal: theme.spacing.sm, paddingVertical: 2 },
  origenAuto: { backgroundColor: theme.colors.warningLight },
  origenManual: { backgroundColor: theme.colors.primaryLight },
  origenTexto: { color: theme.colors.textPrimary, fontSize: theme.fontSize.xs, fontWeight: "700" },
});
