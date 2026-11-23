import { onlineManager } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton } from "@/components/Boton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PantallaCarga } from "@/components/PantallaCarga";
import { ReasonChips } from "@/components/ReasonChips";
import { useInsumo } from "@/hooks/useInsumos";
import { useRegistrarMovimiento } from "@/hooks/useMovimientos";
import { theme } from "@/theme/theme";
import type { Motivo } from "@/types/database";
import { acotarDelta, stockProyectado } from "@/utils/delta";
import { formatearCantidad, parsearNumero } from "@/utils/formato";
import { generarUuid } from "@/utils/uuid";
import { codigoDeError, mensajeDeError } from "@/utils/errores";
import { useToast } from "@/providers/FeedbackProvider";
import { Aviso } from "@/components/Aviso";

export function MovimientoModalScreen() {
  const router = useRouter();
  const { insumoId, delta: deltaParam } = useLocalSearchParams<{ insumoId: string; delta?: string }>();
  const insumo = useInsumo(insumoId);
  const registrar = useRegistrarMovimiento();
  const toast = useToast();

  // opId se genera una sola vez al montar y se reutiliza en cada reintento (RN-04)
  const opId = useRef(generarUuid()).current;

  const [delta, setDelta] = useState(() => parsearNumero(deltaParam ?? "0"));
  const [motivo, setMotivo] = useState<Motivo | null>(() =>
    parsearNumero(deltaParam ?? "0") < 0 ? "Uso en preparación" : "Compra recibida",
  );
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (insumo.isLoading) return <PantallaCarga />;
  if (insumo.isError) return <ErrorState message={mensajeDeError(insumo.error)} onRetry={() => void insumo.refetch()} />;
  const datos = insumo.data;
  if (!datos) return <EmptyState title="Insumo no encontrado" message="Pudo haber sido desactivado." />;

  const resultante = stockProyectado(datos.stock_actual, delta);
  const registrando = registrar.isPending;
  const puedeRegistrar = delta !== 0 && motivo !== null && !registrando;

  const alRegistrar = async () => {
    if (!motivo || delta === 0) return;
    setError(null);

    const variables = {
      insumoId: datos.id,
      delta,
      motivo,
      nota: motivo === "Otro" ? nota.trim() || undefined : undefined,
      opId,
    };

    // Sin conexión: la mutación queda en cola (se persiste y se reenvía con el mismo opId)
    if (!onlineManager.isOnline()) {
      registrar.mutate(variables);
      toast.aviso("Guardado sin conexión", "Se enviará solo cuando vuelva el internet.");
      router.back();
      return;
    }

    try {
      await registrar.mutateAsync(variables);
      try {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // háptico opcional
      }
      router.back();
      toast.exito("Stock actualizado", `${datos.nombre}: ${formatearCantidad(resultante)} ${datos.unidad_medida}`);
    } catch (e) {
      const mensaje = mensajeDeError(e, "No pudimos registrar el movimiento. Inténtalo de nuevo.");
      const sinStock = codigoDeError(e) === "stock_insuficiente";
      // CU-01 B: recalcula con el stock actual del servidor (el rollback ya restauró la caché)
      const { data: fresco } = await insumo.refetch();
      if (fresco) setDelta((d) => acotarDelta(d, fresco.stock_actual));
      setError(
        sinStock && fresco
          ? `Solo hay ${formatearCantidad(fresco.stock_actual)} ${fresco.unidad_medida} disponibles. Ajustamos la cantidad al máximo posible; revisa y vuelve a registrar.`
          : mensaje,
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.tituloModal}>Registrar movimiento</Text>
          <Text style={styles.nombre}>{datos.nombre}</Text>

          <View style={styles.resumen} accessibilityLiveRegion="polite">
            <Text style={styles.resumenEtiqueta}>Stock</Text>
            <Text style={styles.resumenValor}>
              {formatearCantidad(datos.stock_actual)} → {formatearCantidad(resultante)}
            </Text>
            <Text style={[styles.delta, delta < 0 ? styles.salida : styles.entrada]}>
              {delta > 0 ? "+" : delta < 0 ? "−" : ""}
              {formatearCantidad(Math.abs(delta))} {datos.unidad_medida}
            </Text>
          </View>

          <Text style={styles.seccion}>Motivo</Text>
          <ReasonChips value={motivo} onChange={setMotivo} disabled={registrando} />

          {motivo === "Otro" && (
            <View style={styles.campoNota}>
              <Text style={styles.seccion}>Nota (opcional)</Text>
              <TextInput
                accessibilityLabel="Nota del movimiento"
                value={nota}
                onChangeText={setNota}
                placeholder="Describe el motivo"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                multiline
                maxLength={200}
              />
            </View>
          )}

          {error && <Aviso tipo="error" mensaje={error} />}

          <Boton titulo="Registrar" onPress={() => void alRegistrar()} disabled={!puedeRegistrar} cargando={registrando} />
          <Boton titulo="Cancelar" variante="secundario" onPress={() => router.back()} disabled={registrando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tituloModal: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: "700", textAlign: "center", textTransform: "uppercase" },
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  contenido: { gap: theme.spacing.md, padding: theme.spacing.md },
  nombre: { color: theme.colors.textPrimary, fontSize: theme.fontSize.lg, fontWeight: "800" },
  resumen: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    gap: 2,
    padding: theme.spacing.md,
  },
  resumenEtiqueta: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  resumenValor: { color: theme.colors.textPrimary, fontSize: 36, fontWeight: "800" },
  delta: { fontSize: theme.fontSize.md, fontWeight: "700" },
  salida: { color: theme.colors.error },
  entrada: { color: theme.colors.primaryDark },
  seccion: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, fontWeight: "700" },
  campoNota: { gap: theme.spacing.xs },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    minHeight: 64,
    padding: theme.spacing.md,
    textAlignVertical: "top",
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    padding: theme.spacing.md,
  },
});
