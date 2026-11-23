import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { InsumoCard } from "@/components/InsumoCard";
import { PantallaCarga } from "@/components/PantallaCarga";
import { useCategorias } from "@/hooks/useCatalogos";
import { useDebounce } from "@/hooks/useDebounce";
import { useInsumos } from "@/hooks/useInsumos";
import type { FiltrosInsumos } from "@/services/insumos";
import { theme } from "@/theme/theme";
import type { Insumo } from "@/types/database";
import { mensajeDeError } from "@/utils/errores";

type FiltroEstado = NonNullable<FiltrosInsumos["estado"]> | null;

const ESTADOS: { label: string; value: FiltroEstado }[] = [
  { label: "Todos", value: null },
  { label: "Bajo", value: "bajo" },
  { label: "Agotado", value: "agotado" },
];

function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={[styles.chip, activo && styles.chipActivo]}
    >
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{texto}</Text>
    </Pressable>
  );
}

export function InventarioListScreen() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [estado, setEstado] = useState<FiltroEstado>(null);
  const busquedaDebounced = useDebounce(busqueda, 300); // RDV-04

  const filtros = useMemo<FiltrosInsumos>(
    () => ({ busqueda: busquedaDebounced, categoriaId, estado }),
    [busquedaDebounced, categoriaId, estado],
  );

  const { data: categorias = [] } = useCategorias();
  const consulta = useInsumos(filtros);
  const insumos = useMemo<Insumo[]>(() => consulta.data?.pages.flat() ?? [], [consulta.data]);

  const abrirDetalle = useCallback(
    (insumoId: string) => router.push({ pathname: "/inventario/[insumoId]", params: { insumoId } }),
    [router],
  );
  const renderItem = useCallback(
    ({ item }: { item: Insumo }) => <InsumoCard insumo={item} onPress={abrirDetalle} />,
    [abrirDetalle],
  );

  if (consulta.isLoading) return <PantallaCarga />;
  if (consulta.isError && insumos.length === 0) {
    return (
      <ErrorState
        message={mensajeDeError(consulta.error)}
        onRetry={() => void consulta.refetch()}
      />
    );
  }

  const hayFiltros = Boolean(busquedaDebounced.trim() || categoriaId || estado);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.encabezado}>
        <View style={styles.filaBusqueda}>
          <TextInput
            accessibilityLabel="Buscar insumo"
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar insumo…"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.busqueda}
            returnKeyType="search"
            autoCorrect={false}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Agregar insumo"
            style={styles.agregar}
            onPress={() => router.push("/inventario/form")}
          >
            <Text style={styles.agregarTexto}>+ Agregar</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {ESTADOS.map((e) => (
            <Chip key={e.label} texto={e.label} activo={estado === e.value} onPress={() => setEstado(e.value)} />
          ))}
        </ScrollView>
        {categorias.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip texto="Todas las categorías" activo={categoriaId === null} onPress={() => setCategoriaId(null)} />
            {categorias.map((c) => (
              <Chip key={c.id} texto={c.nombre} activo={categoriaId === c.id} onPress={() => setCategoriaId(c.id)} />
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={insumos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (consulta.hasNextPage && !consulta.isFetchingNextPage) void consulta.fetchNextPage();
        }}
        refreshControl={
          <RefreshControl
            refreshing={consulta.isRefetching && !consulta.isFetchingNextPage}
            onRefresh={() => void consulta.refetch()}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={hayFiltros ? "Sin resultados" : "Sin inventario"}
            message={
              hayFiltros
                ? "Prueba con otros filtros o con otra búsqueda."
                : "Aún no hay insumos. Agrega el primero para comenzar."
            }
          />
        }
        ListFooterComponent={
          consulta.isFetchingNextPage ? (
            <ActivityIndicator style={styles.pie} color={theme.colors.primary} />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  encabezado: { gap: theme.spacing.sm, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm },
  filaBusqueda: { alignItems: "center", flexDirection: "row", gap: theme.spacing.sm },
  busqueda: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.fontSize.md,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  agregar: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  agregarTexto: { color: theme.colors.white, fontSize: theme.fontSize.sm, fontWeight: "700" },
  chips: { gap: theme.spacing.sm, paddingVertical: 2 },
  chip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: theme.spacing.md,
  },
  chipActivo: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
  chipTexto: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: "600" },
  chipTextoActivo: { color: theme.colors.primaryDark },
  lista: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
  pie: { padding: theme.spacing.md },
});
