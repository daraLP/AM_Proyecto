import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Boton } from "@/components/Boton";
import { ESTILOS_AVISO, type TipoAviso } from "@/components/feedback/tipos";
import { theme } from "@/theme/theme";

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

export interface ToastApi {
  /** Confirmación breve de que algo salió bien. */
  exito: (titulo: string, detalle?: string) => void;
  /** Algo falló pero no bloquea: dice qué pasó y qué hacer. */
  error: (titulo: string, detalle?: string) => void;
  info: (titulo: string, detalle?: string) => void;
  aviso: (titulo: string, detalle?: string) => void;
  cerrar: () => void;
}

export interface OpcionesConfirmar {
  titulo: string;
  mensaje?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Acción destructiva: botón rojo e ícono de advertencia. */
  peligro?: boolean;
}

export interface OpcionesInformar {
  titulo: string;
  mensaje?: string;
  tipo?: TipoAviso;
  textoCerrar?: string;
  /** Acción útil además de cerrar, p. ej. «Abrir Ajustes». */
  accion?: { texto: string; alPulsar: () => void };
}

export interface DialogoApi {
  /** Pide confirmación. Resuelve true si la persona confirma, false si cancela o cierra. */
  confirmar: (opciones: OpcionesConfirmar) => Promise<boolean>;
  /** Mensaje importante que requiere un «Entendido». */
  informar: (opciones: OpcionesInformar) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

const DURACION_MS: Record<TipoAviso, number> = { exito: 2600, info: 3200, aviso: 4200, error: 5200 };

interface DatosToast {
  id: number;
  tipo: TipoAviso;
  titulo: string;
  detalle?: string;
}

function vibrar(tipo: TipoAviso) {
  try {
    if (tipo === "exito") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (tipo === "error") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (tipo === "aviso") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // el háptico es opcional
  }
}

function ToastVista({ datos, alCerrar }: { datos: DatosToast; alCerrar: (id: number) => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [entrada] = useState(() => new Animated.Value(0));
  const cerrando = useRef(false);
  const estilo = ESTILOS_AVISO[datos.tipo];

  const cerrar = useCallback(() => {
    if (cerrando.current) return;
    cerrando.current = true;
    Animated.timing(entrada, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => alCerrar(datos.id));
  }, [alCerrar, datos.id, entrada]);

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    AccessibilityInfo.announceForAccessibility(
      datos.detalle ? `${datos.titulo}. ${datos.detalle}` : datos.titulo,
    );
    const temporizador = setTimeout(cerrar, DURACION_MS[datos.tipo]);
    return () => clearTimeout(temporizador);
  }, [cerrar, datos.detalle, datos.tipo, datos.titulo, entrada]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.toastPosicion,
        {
          top: insets.top + theme.spacing.sm,
          opacity: entrada,
          transform: [{ translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
        },
      ]}
    >
      <Pressable
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityHint="Toca para cerrar"
        onPress={cerrar}
        style={[styles.toast, { maxWidth: Math.min(width - theme.spacing.md * 2, 480), borderLeftColor: estilo.color }]}
      >
        <View style={[styles.toastIcono, { backgroundColor: estilo.fondo }]}>
          <Ionicons name={estilo.icono} size={22} color={estilo.color} />
        </View>
        <View style={styles.toastTexto}>
          <Text style={styles.toastTitulo} numberOfLines={2}>
            {datos.titulo}
          </Text>
          {datos.detalle ? (
            <Text style={styles.toastDetalle} numberOfLines={3}>
              {datos.detalle}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Diálogo
// ---------------------------------------------------------------------------

interface DatosDialogo {
  tipo: TipoAviso;
  titulo: string;
  mensaje?: string;
  modo: "confirmar" | "informar";
  textoConfirmar: string;
  textoCancelar: string;
  peligro: boolean;
  accion?: { texto: string; alPulsar: () => void };
  resolver: (confirmado: boolean) => void;
}

function DialogoVista({ datos, alResolver }: { datos: DatosDialogo; alResolver: (confirmado: boolean) => void }) {
  const { width } = useWindowDimensions();
  const estilo = ESTILOS_AVISO[datos.tipo];
  const iconoPeligro = datos.peligro;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => alResolver(false)}
    >
      <View style={styles.fondo}>
        {/* Tocar fuera cancela (en «informar» equivale a cerrar) */}
        <Pressable
          accessibilityLabel="Cerrar"
          style={StyleSheet.absoluteFill}
          onPress={() => alResolver(false)}
        />
        <View
          accessibilityViewIsModal
          style={[styles.dialogo, { width: Math.min(width - theme.spacing.lg * 2, 360) }]}
        >
          <View
            style={[
              styles.dialogoIcono,
              { backgroundColor: iconoPeligro ? ESTILOS_AVISO.error.fondo : estilo.fondo },
            ]}
          >
            <Ionicons
              name={iconoPeligro ? "trash" : estilo.icono}
              size={30}
              color={iconoPeligro ? ESTILOS_AVISO.error.color : estilo.color}
            />
          </View>
          <Text accessibilityRole="header" style={styles.dialogoTitulo}>
            {datos.titulo}
          </Text>
          {datos.mensaje ? <Text style={styles.dialogoMensaje}>{datos.mensaje}</Text> : null}

          <View style={styles.dialogoAcciones}>
            {datos.modo === "confirmar" ? (
              <View style={styles.fila}>
                <View style={styles.flex}>
                  <Boton titulo={datos.textoCancelar} variante="secundario" onPress={() => alResolver(false)} />
                </View>
                <View style={styles.flex}>
                  <Boton
                    titulo={datos.textoConfirmar}
                    variante={datos.peligro ? "peligro" : "primario"}
                    onPress={() => alResolver(true)}
                  />
                </View>
              </View>
            ) : (
              <>
                {datos.accion ? (
                  <Boton
                    titulo={datos.accion.texto}
                    onPress={() => {
                      datos.accion?.alPulsar();
                      alResolver(true);
                    }}
                  />
                ) : null}
                <Boton
                  titulo={datos.textoCancelar}
                  variante={datos.accion ? "secundario" : "primario"}
                  onPress={() => alResolver(true)}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Proveedor
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastApi | null>(null);
const DialogoContext = createContext<DialogoApi | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<DatosToast | null>(null);
  const [dialogo, setDialogo] = useState<DatosDialogo | null>(null);
  const contador = useRef(0);
  const dialogoActual = useRef<DatosDialogo | null>(null);

  const mostrarToast = useCallback((tipo: TipoAviso, titulo: string, detalle?: string) => {
    contador.current += 1;
    vibrar(tipo);
    setToast({ id: contador.current, tipo, titulo, detalle });
  }, []);

  const cerrarToast = useCallback((id?: number) => {
    setToast((actual) => (id === undefined || actual?.id === id ? null : actual));
  }, []);

  const abrirDialogo = useCallback((datos: Omit<DatosDialogo, "resolver">) => {
    return new Promise<boolean>((resolve) => {
      // Un solo diálogo a la vez: el anterior se resuelve como cancelado
      dialogoActual.current?.resolver(false);
      const completo: DatosDialogo = { ...datos, resolver: resolve };
      dialogoActual.current = completo;
      setDialogo(completo);
    });
  }, []);

  const resolverDialogo = useCallback((confirmado: boolean) => {
    const actual = dialogoActual.current;
    dialogoActual.current = null;
    setDialogo(null);
    actual?.resolver(confirmado);
  }, []);

  const toastApi = useMemo<ToastApi>(
    () => ({
      exito: (t, d) => mostrarToast("exito", t, d),
      error: (t, d) => mostrarToast("error", t, d),
      info: (t, d) => mostrarToast("info", t, d),
      aviso: (t, d) => mostrarToast("aviso", t, d),
      cerrar: () => cerrarToast(),
    }),
    [mostrarToast, cerrarToast],
  );

  const dialogoApi = useMemo<DialogoApi>(
    () => ({
      confirmar: (o) =>
        abrirDialogo({
          tipo: o.peligro ? "error" : "info",
          titulo: o.titulo,
          mensaje: o.mensaje,
          modo: "confirmar",
          textoConfirmar: o.textoConfirmar ?? "Confirmar",
          textoCancelar: o.textoCancelar ?? "Cancelar",
          peligro: o.peligro ?? false,
        }).then((r) => r),
      informar: (o) =>
        abrirDialogo({
          tipo: o.tipo ?? "info",
          titulo: o.titulo,
          mensaje: o.mensaje,
          modo: "informar",
          textoConfirmar: "Entendido",
          textoCancelar: o.textoCerrar ?? "Entendido",
          peligro: false,
          accion: o.accion,
        }).then(() => undefined),
    }),
    [abrirDialogo],
  );

  return (
    <ToastContext.Provider value={toastApi}>
      <DialogoContext.Provider value={dialogoApi}>
        {children}
        {toast ? <ToastVista key={toast.id} datos={toast} alCerrar={cerrarToast} /> : null}
        {dialogo ? <DialogoVista datos={dialogo} alResolver={resolverDialogo} /> : null}
      </DialogoContext.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <FeedbackProvider>.");
  return ctx;
}

export function useDialogo(): DialogoApi {
  const ctx = useContext(DialogoContext);
  if (!ctx) throw new Error("useDialogo debe usarse dentro de <FeedbackProvider>.");
  return ctx;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fila: { flexDirection: "row", gap: theme.spacing.sm },
  // --- toast ---
  toastPosicion: { alignItems: "center", left: 0, position: "absolute", right: 0, zIndex: 1000 },
  toast: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 5,
    borderRadius: theme.borderRadius.lg,
    elevation: 8,
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.sm + 2,
    paddingRight: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
  },
  toastIcono: {
    alignItems: "center",
    borderRadius: theme.borderRadius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  toastTexto: { flexShrink: 1, gap: 2 },
  toastTitulo: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, fontWeight: "800" },
  toastDetalle: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, lineHeight: 19 },
  // --- diálogo ---
  fondo: { alignItems: "center", backgroundColor: "rgba(20, 28, 32, 0.55)", flex: 1, justifyContent: "center" },
  dialogo: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    elevation: 12,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  dialogoIcono: {
    alignItems: "center",
    borderRadius: theme.borderRadius.pill,
    height: 64,
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
    width: 64,
  },
  dialogoTitulo: { color: theme.colors.textPrimary, fontSize: theme.fontSize.lg, fontWeight: "800", textAlign: "center" },
  dialogoMensaje: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, lineHeight: 22, textAlign: "center" },
  dialogoAcciones: { alignSelf: "stretch", gap: theme.spacing.sm, marginTop: theme.spacing.md },
});
