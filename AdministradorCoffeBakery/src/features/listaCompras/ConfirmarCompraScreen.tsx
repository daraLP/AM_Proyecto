import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton } from "@/components/Boton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PantallaCarga } from "@/components/PantallaCarga";
import { useComprarItem, useItemCompra } from "@/hooks/useCompras";
import { theme } from "@/theme/theme";
import { formatearCantidad } from "@/utils/formato";
import { generarUuid } from "@/utils/uuid";
import { mensajeDeError } from "@/utils/errores";
import { useToast } from "@/providers/FeedbackProvider";
import { Aviso } from "@/components/Aviso";
import { validarCantidad } from "@/utils/validacion";

export function ConfirmarCompraScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const item = useItemCompra(itemId);
  const comprar = useComprarItem();
  const toast = useToast();

  // CA-06: repetir la llamada con el mismo opId no vuelve a sumar
  const opId = useRef(generarUuid()).current;

  const [texto, setTexto] = useState<string | null>(null); // null = usar la cantidad sugerida
  const [error, setError] = useState<string | null>(null);

  if (item.isLoading) return <PantallaCarga />;
  if (item.isError) return <ErrorState message={mensajeDeError(item.error)} onRetry={() => void item.refetch()} />;
  const datos = item.data;
  if (!datos) return <EmptyState title="Ítem no encontrado" message="Quizá ya fue comprado por otra persona." />;
  if (datos.estado === "comprado") {
    return <EmptyState title="Ya está comprado" message="Este ítem se cerró y su stock ya se reintegró." />;
  }

  const validacion = validarCantidad(texto ?? formatearCantidad(datos.cantidad_sugerida));
  const cantidad = validacion.ok ? validacion.valor : 0;
  const stockActual = datos.insumos?.stock_actual ?? 0;
  const unidad = datos.insumos?.unidad_medida ?? "";

  const confirmar = async () => {
    setError(null);
    try {
      await comprar.mutateAsync({ itemId: datos.id, cantidad, opId });
      router.back();
      toast.exito("Compra registrada", `El stock de ${datos.insumos?.nombre ?? "tu insumo"} ya se actualizó.`);
    } catch (e) {
      setError(mensajeDeError(e, "No pudimos registrar la compra. Inténtalo de nuevo."));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.tituloModal}>Confirmar compra</Text>
          <Text style={styles.nombre}>{datos.insumos?.nombre ?? "Insumo"}</Text>
          {datos.proveedores && <Text style={styles.meta}>Proveedor: {datos.proveedores.nombre}</Text>}

          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Cantidad comprada ({unidad})</Text>
            <TextInput
              accessibilityLabel="Cantidad comprada"
              value={texto ?? formatearCantidad(datos.cantidad_sugerida)}
              onChangeText={(t) => /^\d*[.,]?\d{0,3}$/.test(t) && setTexto(t)}
              keyboardType="decimal-pad"
              maxLength={10}
              selectTextOnFocus
              style={styles.input}
            />
          </View>

          <View style={styles.resumen}>
            <Text style={styles.meta}>Stock después de la compra</Text>
            <Text style={styles.resumenValor}>
              {formatearCantidad(stockActual)} → {formatearCantidad(stockActual + cantidad)} {unidad}
            </Text>
          </View>

          {!validacion.ok && texto !== null && <Aviso tipo="aviso" mensaje={validacion.error} />}
          {error && <Aviso tipo="error" mensaje={error} />}

          <Boton
            titulo="Confirmar compra"
            onPress={() => void confirmar()}
            disabled={!validacion.ok}
            cargando={comprar.isPending}
          />
          <Boton titulo="Cancelar" variante="secundario" onPress={() => router.back()} disabled={comprar.isPending} />
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
  meta: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  campo: { gap: theme.spacing.xs },
  etiqueta: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, fontWeight: "700" },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    minHeight: 60,
    paddingHorizontal: theme.spacing.md,
    textAlign: "center",
  },
  resumen: { alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md },
  resumenValor: { color: theme.colors.textPrimary, fontSize: theme.fontSize.lg, fontWeight: "800" },
  error: {
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    padding: theme.spacing.md,
  },
});
