import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PantallaCarga } from "@/components/PantallaCarga";
import { useAuthStore } from "@/features/auth/authStore";
import { useActividad } from "@/hooks/useActividad";
import { theme } from "@/theme/theme";
import type { MovimientoActividad } from "@/types/database";
import { describirMovimiento, tiempoRelativo } from "@/utils/actividad";
import { mensajeDeError } from "@/utils/errores";

// Quién hizo qué en el inventario: visible para todo el equipo
export function ActividadScreen() {
  const miId = useAuthStore((s) => s.perfil?.id);
  const actividad = useActividad(50);

  if (actividad.isLoading) return <PantallaCarga />;
  if (actividad.isError && !actividad.data) {
    return <ErrorState message={mensajeDeError(actividad.error)} onRetry={() => void actividad.refetch()} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <FlatList
        data={actividad.data ?? []}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
        refreshControl={
          <RefreshControl refreshing={actividad.isRefetching} onRefresh={() => void actividad.refetch()} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState icono="people-outline" title="Aún no hay actividad" message="Cuando alguien del equipo registre un movimiento, aparecerá aquí." />
        }
        renderItem={({ item }) => <Fila movimiento={item} miId={miId} />}
      />
    </SafeAreaView>
  );
}

function Fila({ movimiento: m, miId }: { movimiento: MovimientoActividad; miId?: string }) {
  const { quien, accion } = describirMovimiento(m, miId);
  const salida = m.tipo === "salida";
  return (
    <View style={styles.fila} accessible accessibilityLabel={`${quien} ${accion}. ${m.motivo}. ${tiempoRelativo(m.creado_en)}`}>
      <View style={[styles.avatar, salida ? styles.avatarSalida : styles.avatarEntrada]}>
        <Text style={[styles.inicial, salida ? styles.salida : styles.entrada]}>{quien.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.cuerpo}>
        <Text style={styles.titulo} numberOfLines={2}>
          <Text style={styles.quien}>{quien}</Text> {accion}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {m.motivo} · {tiempoRelativo(m.creado_en)}
        </Text>
        {m.nota ? <Text style={styles.meta} numberOfLines={2}>“{m.nota}”</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  lista: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
  fila: { alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, flexDirection: "row", gap: theme.spacing.md, padding: theme.spacing.md },
  avatar: { alignItems: "center", borderRadius: theme.borderRadius.pill, height: 44, justifyContent: "center", width: 44 },
  avatarEntrada: { backgroundColor: theme.colors.primaryLight },
  avatarSalida: { backgroundColor: theme.colors.errorLight },
  inicial: { fontSize: theme.fontSize.md, fontWeight: "800" },
  entrada: { color: theme.colors.primaryDark },
  salida: { color: theme.colors.error },
  cuerpo: { flex: 1, gap: 2 },
  titulo: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, lineHeight: 20 },
  quien: { fontWeight: "800" },
  meta: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs },
});
