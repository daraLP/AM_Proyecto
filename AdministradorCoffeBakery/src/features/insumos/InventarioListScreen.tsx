import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { listarInsumos } from "../../services/insumos";
import { useEsAdmin } from "../auth/authStore";
import type { Insumo } from "../../types/database";
import type { InventarioStackParamList } from "../../navigation/InventarioStack";
import { theme } from "../../theme/theme";

type Props = NativeStackScreenProps<InventarioStackParamList, "InventarioList">;

export function InventarioListScreen({ navigation }: Props) {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargando, setCargando] = useState(true);
  const esAdmin = useEsAdmin();

  const cargarInsumos = useCallback(async () => {
    setCargando(true);
    const { data, error } = await listarInsumos();

    if (error) {
      console.error("Error al cargar insumos:", error);
    } else {
      setInsumos(data);
    }
    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarInsumos();
    }, [cargarInsumos]),
  );

  if (cargando) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      {esAdmin && (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("InsumoForm", undefined)}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Agregar Insumo</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={insumos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Sin inventario</Text>
            <Text style={styles.emptySubtitle}>
              {esAdmin
                ? "Tu almacén está vacío. Agrega tu primer insumo para comenzar."
                : "Aún no hay insumos registrados."}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const stockBajo = item.estado_stock !== "ok";
          const etiqueta =
            item.estado_stock === "agotado" ? "AGOTADO" : "STOCK BAJO";

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text
                  style={styles.itemName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.nombre}
                </Text>
                {stockBajo && (
                  <View style={styles.badgeDanger}>
                    <Text style={styles.badgeDangerText}>{etiqueta}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.stockDetails}>
                Stock:{" "}
                <Text
                  style={[
                    styles.stockValue,
                    stockBajo && styles.stockValueDanger,
                  ]}
                >
                  {item.stock_actual} {item.unidad_medida}
                </Text>{" "}
                (Mín: {item.stock_minimo})
              </Text>

              {esAdmin && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("InsumoForm", { insumo: item })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.editButtonText}>Editar Insumo</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
  },
  listContent: {
    padding: theme.spacing.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  itemName: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  badgeDanger: {
    backgroundColor: theme.colors.errorLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.pill,
  },
  badgeDangerText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
  },
  stockDetails: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  stockValue: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  stockValueDanger: {
    color: theme.colors.error,
  },
  editButton: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 44,
  },
  editButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: theme.spacing.lg,
  },
});
