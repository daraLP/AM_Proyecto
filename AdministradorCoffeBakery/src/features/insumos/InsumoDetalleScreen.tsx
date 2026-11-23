import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton } from "@/components/Boton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PantallaCarga } from "@/components/PantallaCarga";
import { QuickCounter } from "@/components/QuickCounter";
import { StockBadge } from "@/components/StockBadge";
import { useAuthStore, useEsAdmin } from "@/features/auth/authStore";
import { useInsumo } from "@/hooks/useInsumos";
import { useMovimientos } from "@/hooks/useMovimientos";
import { desactivarInsumo } from "@/services/insumos";
import { useUiStore } from "@/store/uiStore";
import { theme } from "@/theme/theme";
import { formatearCantidad, formatearFecha } from "@/utils/formato";
import { mensajeDeError } from "@/utils/errores";
import { useDialogo, useToast } from "@/providers/FeedbackProvider";

export function InsumoDetalleScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { insumoId } = useLocalSearchParams<{ insumoId: string }>(); // ADR-06: solo el id
  const esAdmin = useEsAdmin();
  const miId = useAuthStore((s) => s.perfil?.id);
  const toast = useToast();
  const dialogo = useDialogo();
  const incrementos = useUiStore((s) => s.incrementos);

  const insumo = useInsumo(insumoId);
  const movimientos = useMovimientos(insumoId, 5);

  const [delta, setDelta] = useState(0);
  const [claveContador, setClaveContador] = useState(0);

  // Al volver del modal el contador empieza en 0
  useFocusEffect(
    useCallback(() => {
      setDelta(0);
      setClaveContador((k) => k + 1);
    }, []),
  );

  if (insumo.isLoading) return <PantallaCarga />;
  if (insumo.isError) {
    return <ErrorState message={mensajeDeError(insumo.error)} onRetry={() => void insumo.refetch()} />;
  }
  const datos = insumo.data;
  if (!datos) {
    return <EmptyState title="Insumo no encontrado" message="Pudo haber sido desactivado." />;
  }

  const confirmarDesactivar = async () => {
    const confirmado = await dialogo.confirmar({
      titulo: "¿Desactivar este insumo?",
      mensaje: `«${datos.nombre}» dejará de aparecer en el inventario. Su historial se conserva.`,
      textoConfirmar: "Desactivar",
      peligro: true,
    });
    if (!confirmado) return;
    const { error } = await desactivarInsumo(datos.id);
    if (error) return toast.error("No pudimos desactivar el insumo", error);
    void queryClient.invalidateQueries({ queryKey: ["insumos"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    router.back();
    toast.exito("Insumo desactivado", `«${datos.nombre}» ya no aparece en el inventario.`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ title: datos.nombre }} />
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <View style={styles.cabecera}>
          {datos.foto_url ? (
            <Image source={{ uri: datos.foto_url }} style={styles.foto} />
          ) : (
            <View style={[styles.foto, styles.fotoVacia]}>
              <Text style={styles.inicial}>{datos.nombre.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.cabeceraTexto}>
            <Text style={styles.nombre}>{datos.nombre}</Text>
            <StockBadge estado={datos.estado_stock} />
          </View>
        </View>

        <View style={styles.stockCaja}>
          <Text style={styles.stockEtiqueta}>Stock actual</Text>
          <Text style={styles.stockValor} accessibilityLabel={`Stock actual ${formatearCantidad(datos.stock_actual)} ${datos.unidad_medida}`}>
            {formatearCantidad(datos.stock_actual)}
            <Text style={styles.stockUnidad}> {datos.unidad_medida}</Text>
          </Text>
          <Text style={styles.stockMinimo}>Mínimo: {formatearCantidad(datos.stock_minimo)}</Text>
        </View>

        <QuickCounter
          key={claveContador}
          stockActual={datos.stock_actual}
          unidad={datos.unidad_medida}
          incrementos={incrementos}
          onChangeDelta={setDelta}
        />

        <View style={styles.acciones}>
          <Boton
            titulo="Editar insumo"
            variante="secundario"
            onPress={() => router.push({ pathname: "/inventario/form", params: { id: datos.id } })}
          />
          <Boton
            titulo="Cambiar foto"
            variante="secundario"
            onPress={() => router.push({ pathname: "/scan-modal", params: { insumoId: datos.id } })}
          />
          {esAdmin && <Boton titulo="Desactivar insumo" variante="peligro" onPress={() => void confirmarDesactivar()} />}
        </View>

        <Text style={styles.seccion}>Historial reciente</Text>
        {movimientos.isLoading && <Text style={styles.vacio}>Cargando historial…</Text>}
        {movimientos.isError && <Text style={styles.vacio}>{mensajeDeError(movimientos.error)}</Text>}
        {movimientos.data?.length === 0 && <Text style={styles.vacio}>Aún no hay movimientos.</Text>}
        {movimientos.data?.map((m) => (
          <View key={m.id} style={styles.movimiento}>
            <View style={styles.movimientoIzquierda}>
              <Text style={styles.movimientoMotivo}>{m.motivo}</Text>
              <Text style={styles.movimientoMeta}>
                {formatearFecha(m.creado_en)} · {m.usuario_id === miId ? "Tú" : (m.perfiles?.nombre ?? "Alguien")}
              </Text>
              {m.nota ? <Text style={styles.movimientoMeta}>“{m.nota}”</Text> : null}
            </View>
            <View style={styles.movimientoDerecha}>
              <Text style={[styles.movimientoCantidad, m.tipo === "salida" ? styles.salida : styles.entrada]}>
                {m.tipo === "salida" ? "−" : "+"}
                {formatearCantidad(m.cantidad)}
              </Text>
              <Text style={styles.movimientoMeta}>Saldo {formatearCantidad(m.saldo_resultante)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Botón fijo abajo (wireframe): abre el modal con el delta elegido */}
      <View style={styles.barraInferior}>
        <Boton
          titulo={delta === 0 ? "Confirmar" : `Confirmar ${delta > 0 ? "+" : "−"}${formatearCantidad(Math.abs(delta))}`}
          disabled={delta === 0}
          onPress={() =>
            router.push({ pathname: "/movimiento-modal", params: { insumoId: datos.id, delta: String(delta) } })
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  contenido: { gap: theme.spacing.lg, padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
  cabecera: { alignItems: "center", flexDirection: "row", gap: theme.spacing.md },
  foto: { borderRadius: theme.borderRadius.lg, height: 84, width: 84 },
  fotoVacia: { alignItems: "center", backgroundColor: theme.colors.primaryLight, justifyContent: "center" },
  inicial: { color: theme.colors.primaryDark, fontSize: theme.fontSize.xl, fontWeight: "700" },
  cabeceraTexto: { alignItems: "flex-start", flex: 1, gap: theme.spacing.xs },
  nombre: { color: theme.colors.textPrimary, fontSize: theme.fontSize.lg, fontWeight: "800" },
  stockCaja: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  stockEtiqueta: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  stockValor: { color: theme.colors.textPrimary, fontSize: 48, fontWeight: "800" },
  stockUnidad: { color: theme.colors.textSecondary, fontSize: theme.fontSize.lg, fontWeight: "600" },
  stockMinimo: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm },
  acciones: { gap: theme.spacing.sm },
  seccion: { color: theme.colors.textPrimary, fontSize: theme.fontSize.md, fontWeight: "800" },
  vacio: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  movimiento: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.md,
  },
  movimientoIzquierda: { flex: 1, gap: 2 },
  movimientoDerecha: { alignItems: "flex-end", gap: 2 },
  movimientoMotivo: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, fontWeight: "700" },
  movimientoMeta: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs },
  movimientoCantidad: { fontSize: theme.fontSize.md, fontWeight: "800" },
  salida: { color: theme.colors.error },
  entrada: { color: theme.colors.primaryDark },
  barraInferior: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    padding: theme.spacing.md,
  },
});
