import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
import { useEsAdmin } from "@/features/auth/authStore";
import { useGestionProveedores, useInsumosDeProveedor, useProveedor } from "@/hooks/useCatalogos";
import { useAgregarCompraManual } from "@/hooks/useCompras";
import { listarInsumos } from "@/services/insumos";
import { theme } from "@/theme/theme";
import type { Insumo } from "@/types/database";
import { formatearCantidad } from "@/utils/formato";
import { ErrorUsuario, mensajeDeError } from "@/utils/errores";
import { useDialogo, useToast } from "@/providers/FeedbackProvider";
import { Aviso } from "@/components/Aviso";
import { SelectorUbicacion } from "@/components/SelectorUbicacion";
import type { Coordenada } from "@/services/geocodificacion";
import { LIMITES, validarTelefono, validarTexto } from "@/utils/validacion";

const ID_NUEVO = "nuevo";

function aCoordenada(lat: string | undefined, lng: string | undefined): Coordenada | null {
  const la = Number(lat);
  const lo = Number(lng);
  return lat && lng && Number.isFinite(la) && Number.isFinite(lo) ? { lat: la, lng: lo } : null;
}

interface FormularioProps {
  inicial?: { nombre: string; telefono: string; direccion: string; latitud: string; longitud: string };
  guardando: boolean;
  onGuardar: (datos: {
    nombre: string;
    telefono: string | null;
    direccion: string | null;
    latitud: number | null;
    longitud: number | null;
  }) => void;
  onCancelar?: () => void;
  /** La pantalla bloquea su scroll mientras se mueve el mapa. */
  onBloquearScroll?: (bloquear: boolean) => void;
}

function FormularioProveedor({ inicial, guardando, onGuardar, onCancelar, onBloquearScroll }: FormularioProps) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [telefono, setTelefono] = useState(inicial?.telefono ?? "");
  const [direccion, setDireccion] = useState(inicial?.direccion ?? "");
  const [coordenada, setCoordenada] = useState<Coordenada | null>(() =>
    aCoordenada(inicial?.latitud, inicial?.longitud),
  );
  const [error, setError] = useState<string | null>(null);

  const guardar = () => {
    const n = validarTexto(nombre, { etiqueta: "el nombre del proveedor", min: 2, max: LIMITES.nombreProveedor });
    if (!n.ok) return setError(n.error);
    const t = validarTelefono(telefono);
    if (!t.ok) return setError(t.error);
    const d = validarTexto(direccion, { etiqueta: "la dirección", max: LIMITES.direccion });
    // La dirección es opcional: vacío es válido, pero un texto demasiado largo no
    if (!d.ok && direccion.trim().length > 0) return setError(d.error);
    setError(null);
    onGuardar({
      nombre: n.valor,
      telefono: t.valor || null,
      direccion: d.ok ? d.valor : null,
      latitud: coordenada?.lat ?? null,
      longitud: coordenada?.lng ?? null,
    });
  };

  const campo = (etiqueta: string, valor: string, cambiar: (t: string) => void, extra?: object) => (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        value={valor}
        onChangeText={cambiar}
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        {...extra}
      />
    </View>
  );

  return (
    <View style={styles.formulario}>
      {campo("Nombre", nombre, setNombre, { maxLength: LIMITES.nombreProveedor })}
      {campo("Teléfono", telefono, setTelefono, { keyboardType: "phone-pad", maxLength: LIMITES.telefono })}
      <SelectorUbicacion
        direccion={direccion}
        onDireccionChange={setDireccion}
        valor={coordenada}
        onChange={setCoordenada}
        onInteraccion={onBloquearScroll}
      />
      {error && <Aviso tipo="error" mensaje={error} />}
      <Boton titulo="Guardar proveedor" onPress={guardar} cargando={guardando} />
      {onCancelar && <Boton titulo="Cancelar" variante="secundario" onPress={onCancelar} disabled={guardando} />}
    </View>
  );
}

export function ProveedorDetalleScreen() {
  const router = useRouter();
  const toast = useToast();
  const dialogo = useDialogo();
  const { proveedorId } = useLocalSearchParams<{ proveedorId: string }>();
  const esAdmin = useEsAdmin();
  const esNuevo = proveedorId === ID_NUEVO;

  const proveedor = useProveedor(esNuevo ? undefined : proveedorId);
  const asociados = useInsumosDeProveedor(esNuevo ? undefined : proveedorId);
  const gestion = useGestionProveedores();
  const agregarCompra = useAgregarCompraManual();
  const [editando, setEditando] = useState(false);
  const [scrollActivo, setScrollActivo] = useState(true);

  const todosInsumos = useQuery({
    queryKey: ["insumos-todos"],
    enabled: esAdmin && !esNuevo,
    queryFn: async () => {
      const { data, error } = await listarInsumos();
      if (error) throw new ErrorUsuario(error);
      return data;
    },
  });

  useEffect(() => {
    // Un barista no puede crear proveedores (RLS): se le devuelve a la lista
    if (esNuevo && !esAdmin) router.back();
  }, [esNuevo, esAdmin, router]);

  if (esNuevo) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
        <Stack.Screen options={{ title: "Nuevo proveedor" }} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={scrollActivo}
          >
            <FormularioProveedor
              onBloquearScroll={(b) => setScrollActivo(!b)}
              guardando={gestion.crear.isPending}
              onGuardar={(datos) =>
                gestion.crear.mutate(datos, {
                  onSuccess: () => {
                    router.back();
                    toast.exito("Proveedor creado", `«${datos.nombre}» ya está en tu lista.`);
                  },
                  onError: (e) => toast.error("No pudimos guardar el proveedor", mensajeDeError(e)),
                })
              }
              onCancelar={() => router.back()}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (proveedor.isLoading) return <PantallaCarga />;
  if (proveedor.isError) return <ErrorState message={mensajeDeError(proveedor.error)} onRetry={() => void proveedor.refetch()} />;
  const datos = proveedor.data;
  if (!datos) return <EmptyState title="Proveedor no encontrado" />;

  const sinCoordenadas = datos.latitud === null || datos.longitud === null;
  const idsAsociados = new Set((asociados.data ?? []).map((i) => i.id));

  const agregarALista = (insumo: Insumo) =>
    agregarCompra.mutate(
      { insumoId: insumo.id, cantidad: Math.max(insumo.stock_minimo, 1), proveedorId: datos.id },
      {
        onSuccess: () => toast.exito("Agregado a la lista", `«${insumo.nombre}» ya está por comprar.`),
        // RN-06: un solo pendiente por insumo
        onError: (e) => toast.error("No pudimos agregarlo a la lista", mensajeDeError(e)),
      },
    );

  const confirmarEliminar = async () => {
    const confirmado = await dialogo.confirmar({
      titulo: "¿Eliminar proveedor?",
      mensaje: `«${datos.nombre}» se quitará de tu lista. Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      peligro: true,
    });
    if (!confirmado) return;
    gestion.eliminar.mutate(datos.id, {
      onSuccess: () => {
        router.back();
        toast.exito("Proveedor eliminado");
      },
      onError: (e) => toast.error("No pudimos eliminar el proveedor", mensajeDeError(e)),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ title: datos.nombre }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={scrollActivo}
          >
          {editando && esAdmin ? (
            <FormularioProveedor
              onBloquearScroll={(b) => setScrollActivo(!b)}
              inicial={{
                nombre: datos.nombre,
                telefono: datos.telefono ?? "",
                direccion: datos.direccion ?? "",
                latitud: datos.latitud === null ? "" : String(datos.latitud),
                longitud: datos.longitud === null ? "" : String(datos.longitud),
              }}
              guardando={gestion.actualizar.isPending}
              onGuardar={(d) =>
                gestion.actualizar.mutate(
                  { id: datos.id, datos: d },
                  {
                    onSuccess: () => {
                      setEditando(false);
                      toast.exito("Proveedor actualizado");
                    },
                    onError: (e) => toast.error("No pudimos guardar el proveedor", mensajeDeError(e)),
                  },
                )
              }
              onCancelar={() => setEditando(false)}
            />
          ) : (
            <View style={styles.tarjeta}>
              <Text style={styles.nombre}>{datos.nombre}</Text>
              {datos.telefono ? (
                <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(`tel:${datos.telefono}`)}>
                  <Text style={styles.enlace}>📞 {datos.telefono}</Text>
                </Pressable>
              ) : (
                <Text style={styles.meta}>Sin teléfono</Text>
              )}
              {datos.direccion ? <Text style={styles.meta}>📍 {datos.direccion}</Text> : <Text style={styles.meta}>Sin dirección</Text>}
              {sinCoordenadas && (
                <Text style={styles.aviso}>
                  Este proveedor no tiene coordenadas, por eso no aparece en el mapa.
                  {esAdmin ? " Edítalo para agregarlas." : ""}
                </Text>
              )}
              {esAdmin && (
                <View style={{ gap: theme.spacing.sm }}>
                  <Boton titulo="Editar proveedor" variante="secundario" onPress={() => setEditando(true)} />
                  <Boton titulo="Eliminar proveedor" variante="peligro" onPress={() => void confirmarEliminar()} />
                </View>
              )}
            </View>
          )}

          <Text style={styles.seccion}>Insumos que surte</Text>
          {asociados.isLoading && <Text style={styles.meta}>Cargando…</Text>}
          {asociados.data?.length === 0 && <Text style={styles.meta}>Aún no tiene insumos asociados.</Text>}
          {asociados.data?.map((i) => (
            <View key={i.id} style={styles.insumo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.insumoNombre}>{i.nombre}</Text>
                <Text style={styles.meta}>
                  Stock {formatearCantidad(i.stock_actual)} {i.unidad_medida}
                </Text>
              </View>
              <Boton titulo="Agregar a la lista" variante="secundario" onPress={() => agregarALista(i)} disabled={agregarCompra.isPending} />
            </View>
          ))}

          {esAdmin && (
            <>
              <Text style={styles.seccion}>Asociar insumos</Text>
              {todosInsumos.isLoading && <Text style={styles.meta}>Cargando insumos…</Text>}
              {todosInsumos.data?.map((i) => (
                <View key={i.id} style={styles.insumo}>
                  <Text style={[styles.insumoNombre, { flex: 1 }]}>{i.nombre}</Text>
                  <Switch
                    accessibilityLabel={`Asociar ${i.nombre}`}
                    value={idsAsociados.has(i.id)}
                    onValueChange={(valor) => {
                      const args = { proveedorId: datos.id, insumoId: i.id };
                      const opciones = { onError: (e: Error) => toast.error("No pudimos actualizar los insumos", mensajeDeError(e)) };
                      if (valor) gestion.asociar.mutate(args, opciones);
                      else gestion.desasociar.mutate(args, opciones);
                    }}
                    trackColor={{ true: theme.colors.primary }}
                  />
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  contenido: { gap: theme.spacing.md, padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
  tarjeta: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, gap: theme.spacing.sm, padding: theme.spacing.md },
  nombre: { color: theme.colors.textPrimary, fontSize: theme.fontSize.lg, fontWeight: "800" },
  meta: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  enlace: { color: theme.colors.primaryDark, fontSize: theme.fontSize.md, fontWeight: "700", minHeight: 32 },
  aviso: { backgroundColor: theme.colors.warningLight, borderRadius: theme.borderRadius.md, color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, padding: theme.spacing.md },
  seccion: { color: theme.colors.textPrimary, fontSize: theme.fontSize.md, fontWeight: "800", marginTop: theme.spacing.sm },
  insumo: { alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, flexDirection: "row", gap: theme.spacing.sm, minHeight: 56, padding: theme.spacing.md },
  insumoNombre: { color: theme.colors.textPrimary, fontSize: theme.fontSize.md, fontWeight: "700" },
  formulario: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, gap: theme.spacing.md, padding: theme.spacing.md },
  campo: { gap: theme.spacing.xs },
  etiqueta: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, fontWeight: "700" },
  input: { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, borderWidth: 1, color: theme.colors.textPrimary, fontSize: theme.fontSize.md, minHeight: 48, paddingHorizontal: theme.spacing.md },
  error: { backgroundColor: theme.colors.errorLight, borderRadius: theme.borderRadius.md, color: theme.colors.error, padding: theme.spacing.md },
});
