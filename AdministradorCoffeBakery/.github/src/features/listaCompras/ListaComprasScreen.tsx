import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Boton } from "@/components/Boton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PantallaCarga } from "@/components/PantallaCarga";
import { ShoppingItem } from "@/components/ShoppingItem";
import { SupplierMap } from "@/components/SupplierMap";
import { useEsAdmin } from "@/features/auth/authStore";
import { useProveedores } from "@/hooks/useCatalogos";
import { useAgregarCompraManual, useCompras } from "@/hooks/useCompras";
import { useProveedoresCercanos } from "@/hooks/useProveedoresCercanos";
import { useUbicacion } from "@/hooks/useUbicacion";
import { listarInsumos } from "@/services/insumos";
import { theme } from "@/theme/theme";
import type { Insumo } from "@/types/database";
import { formatearDistancia } from "@/utils/formato";
import {
  LIMITES,
  filtrarEntradaNumerica,
  validarCantidad,
} from "@/utils/validacion";
import { ErrorUsuario, mensajeDeError } from "@/utils/errores";
import { useToast } from "@/providers/FeedbackProvider";
import { Aviso } from "@/components/Aviso";

function ModalAgregarManual({
  visible,
  onCerrar,
}: {
  visible: boolean;
  onCerrar: () => void;
}) {
  const agregar = useAgregarCompraManual();
  const toast = useToast();
  const [filtro, setFiltro] = useState("");
  const [elegido, setElegido] = useState<Insumo | null>(null);
  const [cantidad, setCantidad] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const validacion = validarCantidad(cantidad);

  const insumos = useQuery({
    queryKey: ["insumos-todos"],
    queryFn: async () => {
      const { data, error: e } = await listarInsumos();
      if (e) throw new ErrorUsuario(e);
      return data;
    },
    enabled: visible,
  });

  const visibles = useMemo(
    () =>
      (insumos.data ?? []).filter((i) =>
        i.nombre.toLowerCase().includes(filtro.trim().toLowerCase()),
      ),
    [insumos.data, filtro],
  );

  const cerrar = () => {
    setFiltro("");
    setElegido(null);
    setCantidad("1");
    setError(null);
    onCerrar();
  };

  const guardar = async () => {
    if (!elegido || !validacion.ok) return;
    setError(null);
    try {
      await agregar.mutateAsync({
        insumoId: elegido.id,
        cantidad: validacion.valor,
        proveedorId: elegido.proveedor_principal_id,
      });
      cerrar();
      toast.exito(
        "Agregado a la lista",
        `«${elegido.nombre}» ya está por comprar.`,
      );
    } catch (e) {
      // Conflicto del índice único: «Ya hay un pendiente para este insumo»
      setError(
        mensajeDeError(e, "No pudimos agregar el insumo. Inténtalo de nuevo."),
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={cerrar}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modal}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Text style={styles.modalTitulo}>Agregar a la lista</Text>

          {!elegido ? (
            <>
              <TextInput
                accessibilityLabel="Buscar insumo"
                value={filtro}
                onChangeText={setFiltro}
                placeholder="Buscar insumo…"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={LIMITES.nombreInsumo}
                style={styles.input}
              />
              {insumos.isLoading && (
                <ActivityIndicator style={{ marginTop: theme.spacing.md }} />
              )}
              {insumos.isError && (
                <Aviso tipo="error" mensaje={mensajeDeError(insumos.error)} />
              )}
              <FlatList
                data={visibles}
                keyExtractor={(i) => i.id}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <Text style={styles.opcionMeta}>
                    {insumos.isLoading || insumos.isError
                      ? ""
                      : filtro.trim()
                        ? "Ningún insumo coincide con tu búsqueda."
                        : "Aún no hay insumos. Agrégalos desde Inventario."}
                  </Text>
                }

                renderItem={({ item }) => (
                  <Pressable
                    style={styles.opcion}
                    onPress={() => setElegido(item)}
                  >
                    <Text style={styles.opcionTexto}>{item.nombre}</Text>
                    <Text style={styles.opcionMeta}>{item.unidad_medida}</Text>
                  </Pressable>
                )}
              />
            </>
          ) : (
            <View style={styles.formularioManual}>
              <Text style={styles.nombreElegido}>{elegido.nombre}</Text>
              <Text style={styles.etiqueta}>
                Cantidad ({elegido.unidad_medida})
              </Text>
              <TextInput
                accessibilityLabel="Cantidad a comprar"
                value={cantidad}
                onChangeText={(t) => setCantidad(filtrarEntradaNumerica(t))}
                keyboardType="decimal-pad"
                maxLength={10}
                style={styles.input}
              />
              {!validacion.ok && (
                <Aviso tipo="aviso" mensaje={validacion.error} />
              )}
              {error && <Aviso tipo="error" mensaje={error} />}
              <Boton
                titulo="Agregar"
                onPress={() => void guardar()}
                disabled={!validacion.ok}
                cargando={agregar.isPending}
              />
              <Boton
                titulo="Elegir otro insumo"
                variante="secundario"
                onPress={() => {
                  setElegido(null);
                  setError(null);
                }}
              />
            </View>
          )}
          <View style={styles.cerrar}>
            <Boton titulo="Cerrar" variante="secundario" onPress={cerrar} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

export function ListaComprasScreen() {
  const router = useRouter();
  const esAdmin = useEsAdmin();
  const compras = useCompras();
  const proveedores = useProveedores();
  const { permiso, puedePreguntar, posicion, solicitar } = useUbicacion();
  const cercanos = useProveedoresCercanos(posicion);
  const [modalManual, setModalManual] = useState(false);

  const distanciaPorId = useMemo(() => {
    const mapa = new Map<string, number | null>();
    for (const p of cercanos.data ?? []) mapa.set(p.id, p.distancia_m);
    return mapa;
  }, [cercanos.data]);

  // Todos los proveedores (también los sin coordenadas, para poder completarlos), cercanos primero
  const listaProveedores = useMemo(() => {
    const todos = [...(proveedores.data ?? [])];
    todos.sort((a, b) => {
      const da = distanciaPorId.get(a.id) ?? Number.POSITIVE_INFINITY;
      const db = distanciaPorId.get(b.id) ?? Number.POSITIVE_INFINITY;
      return da === db ? a.nombre.localeCompare(b.nombre) : da - db;
    });
    return todos;
  }, [proveedores.data, distanciaPorId]);

  if (compras.isLoading) return <PantallaCarga />;
  if (compras.isError && !compras.data) {
    return (
      <ErrorState
        message={mensajeDeError(compras.error)}
        onRetry={() => void compras.refetch()}
      />
    );
  }

  const abrirProveedor = (proveedorId: string) =>
    router.push({
      pathname: "/compras/proveedor/[proveedorId]",
      params: { proveedorId },
    });

  const Encabezado = (
    <View style={styles.encabezado}>
      <View style={styles.mapa}>
        <SupplierMap
          proveedores={cercanos.data ?? []}
          posicion={posicion}
          onSeleccionar={abrirProveedor}
        />
      </View>
      {permiso === "denegado" && (
        <Pressable
          style={styles.aviso}
          onPress={() =>
            puedePreguntar ? void solicitar() : void Linking.openSettings()
          }
          accessibilityRole="button"
        >
          <Text style={styles.avisoTexto}>
            {puedePreguntar
              ? "Sin permiso de ubicación: no se muestran distancias. Toca para intentarlo de nuevo."
              : "Sin permiso de ubicación: no se muestran distancias. Toca para activarlo en Ajustes."}
          </Text>
        </Pressable>
      )}
      <View style={styles.filaTitulo}>
        <Text style={styles.titulo}>
          Por comprar ({compras.data?.length ?? 0})
        </Text>
        <Boton
          titulo="+ Agregar manual"
          variante="secundario"
          onPress={() => setModalManual(true)}
        />
      </View>
    </View>
  );

  const Pie = (
    <View style={styles.pie}>
      <View style={styles.filaTitulo}>
        <Text style={styles.titulo}>Proveedores</Text>
        {esAdmin && (
          <Boton
            titulo="+ Nuevo"
            variante="secundario"
            onPress={() =>
              router.push({
                pathname: "/compras/proveedor/[proveedorId]",
                params: { proveedorId: "nuevo" },
              })
            }
          />
        )}
      </View>
      {listaProveedores.length === 0 && (
        <Text style={styles.vacio}>Aún no hay proveedores registrados.</Text>
      )}
      {listaProveedores.map((p) => {
        const distancia = distanciaPorId.get(p.id);
        const sinCoordenadas = p.latitud === null || p.longitud === null;
        return (
          <Pressable
            key={p.id}
            style={styles.proveedor}
            onPress={() => abrirProveedor(p.id)}
            accessibilityRole="button"
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.proveedorNombre}>{p.nombre}</Text>
              {sinCoordenadas && (
                <Text style={styles.proveedorMeta}>
                  Sin ubicación: no aparece en el mapa
                </Text>
              )}
            </View>
            {distancia !== null && distancia !== undefined && (
              <Text style={styles.distancia}>
                {formatearDistancia(distancia)}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <FlatList
        data={compras.data ?? []}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ShoppingItem
            item={item}
            onMarcar={(itemId) =>
              router.push({
                pathname: "/confirmar-compra-modal",
                params: { itemId },
              })
            }
            onAbrirProveedor={abrirProveedor}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: theme.spacing.sm }} />
        )}
        ListHeaderComponent={Encabezado}
        ListFooterComponent={Pie}
        ListEmptyComponent={
          <EmptyState
            title="Todo en orden"
            message="No hay insumos pendientes de compra."
          />
        }
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={compras.isRefetching}
            onRefresh={() => {
              void compras.refetch();
              void proveedores.refetch();
            }}
            tintColor={theme.colors.primary}
          />
        }
      />
      <ModalAgregarManual
        visible={modalManual}
        onCerrar={() => setModalManual(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  lista: { paddingBottom: theme.spacing.xl },
  encabezado: { gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  mapa: { height: 280 }, // ≈ 40 % de pantalla (wireframe)
  aviso: {
    backgroundColor: theme.colors.warningLight,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  avisoTexto: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm },
  filaTitulo: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
  },
  titulo: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: "800",
  },
  pie: { gap: theme.spacing.sm, marginTop: theme.spacing.lg },
  vacio: {
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.md,
  },
  proveedor: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    marginHorizontal: theme.spacing.md,
    minHeight: 56,
    padding: theme.spacing.md,
  },
  proveedorNombre: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
  proveedorMeta: { color: theme.colors.warning, fontSize: theme.fontSize.xs },
  distancia: {
    color: theme.colors.primaryDark,
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
  },
  modal: {
    backgroundColor: theme.colors.background,
    flex: 1,
    padding: theme.spacing.md,
  },
  modalTitulo: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  opcion: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    alignItems: "center",
  },
  opcionTexto: { color: theme.colors.textPrimary, fontSize: theme.fontSize.md },
  opcionMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  formularioManual: { gap: theme.spacing.md },
  nombreElegido: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
  },
  etiqueta: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.error,
    padding: theme.spacing.md,
  },
  cerrar: { marginTop: theme.spacing.md },
});
