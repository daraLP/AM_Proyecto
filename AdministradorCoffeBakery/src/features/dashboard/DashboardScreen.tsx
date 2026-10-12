import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDashboard } from "../../hooks/useDashboard";
import { useEsAdmin } from "../auth/authStore";
import { theme } from "../../theme/theme";

export function DashboardScreen() {
  const router = useRouter();
  const esAdmin = useEsAdmin();
  const {
    resumen,
    consumo,
    cargando,
    actualizando,
    error,
    refrescar,
  } = useDashboard();

  if (cargando && !resumen) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
        <Text style={styles.statusText}>Cargando resumen...</Text>
      </SafeAreaView>
    );
  }

  if (error && !resumen) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorTitle}>No se pudo cargar el Dashboard</Text>
        <Text style={styles.statusText}>{error.message}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reintentar carga del Dashboard"
          style={styles.primaryButton}
          onPress={() => void refrescar()}
        >
          <Text style={styles.primaryButtonText}>Reintentar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const hayAlertas = (resumen?.bajo ?? 0) > 0 || (resumen?.agotado ?? 0) > 0;
  const datosGrafico = consumo.map((registro) => ({
    value: registro.salidas,
    label: registro.dia.slice(0, 3),
    frontColor: theme.colors.secondary,
    topLabelComponent: () => (
      <Text style={styles.chartValue}>{registro.salidas}</Text>
    ),
  }));

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => void refrescar()}
            tintColor={theme.colors.secondary}
            colors={[theme.colors.secondary]}
          />
        }
      >
        <Text style={styles.eyebrow}>POSCAFÉ</Text>
        <Text style={styles.title}>Resumen operativo</Text>
        <Text style={styles.subtitle}>
          Consulta el estado de tu inventario y consumo reciente.
        </Text>

        <View style={styles.metricsRow}>
          <MetricCard label="Total Insumos" value={resumen?.total ?? 0} />
          <MetricCard
            label="Stock Bajo"
            value={resumen?.bajo ?? 0}
            tone="warning"
          />
          <MetricCard
            label="Agotados"
            value={resumen?.agotado ?? 0}
            tone="danger"
          />
        </View>

        {hayAlertas && (
          <View style={styles.alertCard} accessibilityRole="summary">
            <View style={styles.alertCopy}>
              <Text style={styles.alertTitle}>Alertas críticas</Text>
              <Text style={styles.alertText}>
                Hay insumos que requieren reposición.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir lista de compras"
              style={styles.alertButton}
              onPress={() => router.push("/compras")}
            >
              <Text style={styles.alertButtonText}>Ver compras</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Consumo semanal</Text>
          <Text style={styles.sectionHint}>Últimos 7 días</Text>
        </View>
        <View style={styles.chartCard}>
          {datosGrafico.length > 0 ? (
            <BarChart
              data={datosGrafico}
              width={280}
              height={190}
              barWidth={24}
              spacing={18}
              noOfSections={4}
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor={theme.colors.border}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              hideRules
              isAnimated
              maxValue={Math.max(...datosGrafico.map((dato) => dato.value), 1)}
            />
          ) : (
            <Text style={styles.emptyText}>No hay salidas registradas.</Text>
          )}
        </View>

        {esAdmin && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir reporte detallado de consumo"
            style={styles.reportButton}
            onPress={() => router.push("/dashboard/reports")}
          >
            <Text style={styles.reportButtonText}>Ver reporte detallado</Text>
            <Text style={styles.reportArrow}>›</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warning" | "danger";
}) {
  return (
    <View style={[styles.metricCard, styles[`metricCard_${tone}`]]}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  eyebrow: {
    color: theme.colors.secondary,
    fontSize: theme.fontSize.xs,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    marginTop: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  metricsRow: { flexDirection: "row", gap: theme.spacing.sm },
  metricCard: {
    flex: 1,
    minHeight: 112,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 4,
    borderTopColor: theme.colors.secondary,
    justifyContent: "center",
  },
  metricCard_default: {},
  metricCard_warning: { borderTopColor: "#C77B16" },
  metricCard_danger: { borderTopColor: theme.colors.error },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.xl,
    fontWeight: "800",
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.warningLight,
  },
  alertCopy: { flex: 1 },
  alertTitle: { color: "#714B00", fontSize: theme.fontSize.md, fontWeight: "800" },
  alertText: { color: "#714B00", fontSize: theme.fontSize.xs, marginTop: 2 },
  alertButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.secondary,
  },
  alertButtonText: { color: theme.colors.white, fontSize: theme.fontSize.xs, fontWeight: "700" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: theme.fontSize.lg, fontWeight: "800" },
  sectionHint: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs },
  chartCard: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  axisText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs },
  chartValue: { color: theme.colors.textPrimary, fontSize: theme.fontSize.xs },
  emptyText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.secondary,
  },
  reportButtonText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: "700" },
  reportArrow: { color: theme.colors.white, fontSize: theme.fontSize.xl },
  primaryButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.secondary,
  },
  primaryButtonText: { color: theme.colors.white, fontWeight: "700" },
  errorTitle: { color: theme.colors.error, fontSize: theme.fontSize.lg, fontWeight: "700" },
  statusText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, textAlign: "center", marginTop: theme.spacing.sm },
});
