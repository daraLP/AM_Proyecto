import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PantallaCarga } from "@/components/PantallaCarga";
import { obtenerConsumoPorInsumo } from "@/services/dashboard";
import { theme } from "@/theme/theme";
import { formatearCantidad } from "@/utils/formato";
import { mensajeDeError } from "@/utils/errores";

type Rango = "7d" | "30d" | "mes" | "90d";

const RANGOS: { id: Rango; label: string }[] = [
  { id: "7d", label: "7 días" },
  { id: "30d", label: "30 días" },
  { id: "mes", label: "Este mes" },
  { id: "90d", label: "90 días" },
];

// Los límites se alinean a medianoche local para que la clave de caché sea estable
function calcularRango(rango: Rango): { desde: Date; hasta: Date } {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hasta = new Date(hoy);
  hasta.setDate(hasta.getDate() + 1);
  const desde = new Date(hoy);
  if (rango === "mes") desde.setDate(1);
  else desde.setDate(desde.getDate() - (rango === "7d" ? 6 : rango === "30d" ? 29 : 89));
  return { desde, hasta };
}

export function DashboardReportsScreen() {
  const [rango, setRango] = useState<Rango>("7d");
  const { desde, hasta } = useMemo(() => calcularRango(rango), [rango]);

  const consulta = useQuery({
    queryKey: ["dashboard", "reporte", desde.toISOString(), hasta.toISOString()],
    queryFn: () => obtenerConsumoPorInsumo(desde, hasta),
  });

  const filas = useMemo(
    () => (consulta.data ?? []).filter((f) => f.consumido > 0 || f.merma > 0),
    [consulta.data],
  );
  const maximo = Math.max(...filas.map((f) => f.consumido + f.merma), 1);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Reporte de consumo</Text>
        <View style={styles.rangos}>
          {RANGOS.map((r) => (
            <Pressable
              key={r.id}
              accessibilityRole="button"
              accessibilityState={{ selected: rango === r.id }}
              onPress={() => setRango(r.id)}
              style={[styles.chip, rango === r.id && styles.chipActivo]}
            >
              <Text style={[styles.chipTexto, rango === r.id && styles.chipTextoActivo]}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.nota}>
          Las cantidades están en la unidad de cada insumo, por eso no se suman entre insumos.
        </Text>
      </View>

      {consulta.isLoading ? (
        <PantallaCarga />
      ) : consulta.isError ? (
        <ErrorState message={mensajeDeError(consulta.error)} onRetry={() => void consulta.refetch()} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={consulta.isRefetching} onRefresh={() => void consulta.refetch()} />}
        >
          {filas.length === 0 && (
            <EmptyState title="Sin movimientos" message="No hubo uso ni merma en el rango elegido." />
          )}
          {filas.map((f) => (
            <View key={f.insumo_id} style={styles.fila}>
              <View style={styles.filaTitulo}>
                <Text style={styles.nombre} numberOfLines={1}>
                  {f.nombre}
                </Text>
                <Text style={styles.unidad}>{f.unidad_medida}</Text>
              </View>
              <View style={styles.barraFondo}>
                <View style={[styles.barraUso, { flex: f.consumido }]} />
                <View style={[styles.barraMerma, { flex: f.merma }]} />
                <View style={{ flex: Math.max(maximo - f.consumido - f.merma, 0) }} />
              </View>
              <Text style={styles.cifras}>
                Uso: <Text style={styles.negrita}>{formatearCantidad(f.consumido)}</Text> · Merma:{" "}
                <Text style={[styles.negrita, f.merma > 0 && styles.merma]}>{formatearCantidad(f.merma)}</Text>
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  encabezado: { gap: theme.spacing.sm, padding: theme.spacing.md },
  titulo: { color: theme.colors.textPrimary, fontSize: theme.fontSize.xl, fontWeight: "800" },
  rangos: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  chip: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.borderRadius.pill, borderWidth: 1, justifyContent: "center", minHeight: 40, paddingHorizontal: theme.spacing.md },
  chipActivo: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
  chipTexto: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: "600" },
  chipTextoActivo: { color: theme.colors.primaryDark },
  nota: { color: theme.colors.textMuted, fontSize: theme.fontSize.xs },
  lista: { gap: theme.spacing.sm, padding: theme.spacing.md },
  fila: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, gap: theme.spacing.xs, padding: theme.spacing.md },
  filaTitulo: { flexDirection: "row", justifyContent: "space-between" },
  nombre: { color: theme.colors.textPrimary, flex: 1, fontSize: theme.fontSize.md, fontWeight: "700" },
  unidad: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  barraFondo: { backgroundColor: theme.colors.background, borderRadius: 4, flexDirection: "row", height: 8, overflow: "hidden" },
  barraUso: { backgroundColor: theme.colors.secondary },
  barraMerma: { backgroundColor: theme.colors.warning },
  cifras: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  negrita: { color: theme.colors.textPrimary, fontWeight: "700" },
  merma: { color: theme.colors.warning },
});
