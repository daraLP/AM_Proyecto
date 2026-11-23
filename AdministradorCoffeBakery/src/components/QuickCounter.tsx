import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "@/theme/theme";
import { acotarDelta, stockProyectado } from "@/utils/delta";
import { formatearCantidad, parsearNumero } from "@/utils/formato";

export interface QuickCounterProps {
  stockActual: number;
  unidad: string;
  incrementos: number[]; // por defecto [1, 5, 10]; configurable en Perfil
  onChangeDelta: (delta: number) => void; // delta con signo (+ entrada, − salida)
  disabled?: boolean;
}

function vibrar() {
  try {
    void Haptics.selectionAsync();
  } catch {
    // sin soporte háptico: no es crítico
  }
}

export function QuickCounter({
  stockActual,
  unidad,
  incrementos,
  onChangeDelta,
  disabled = false,
}: QuickCounterProps) {
  const [delta, setDelta] = useState(0);
  const [texto, setTexto] = useState("0");
  const [editando, setEditando] = useState(false);

  // RN-01: si el stock baja (otro dispositivo, realtime) el delta se acota al renderizar
  const efectivo = acotarDelta(delta, stockActual);

  // Notifica al padre solo cuando el valor efectivo cambia
  useEffect(() => {
    onChangeDelta(efectivo);
  }, [efectivo, onChangeDelta]);

  const sumarPaso = (paso: number) => {
    if (disabled) return;
    vibrar();
    setDelta(acotarDelta(efectivo + paso, stockActual));
  };

  const alEscribir = (entrada: string) => {
    // Acepta coma o punto, hasta 3 decimales y signo opcional; vacío = 0
    if (!/^-?\d*[.,]?\d{0,3}$/.test(entrada)) return;
    setTexto(entrada);
    setDelta(acotarDelta(parsearNumero(entrada), stockActual));
  };

  const restante = stockProyectado(stockActual, efectivo);
  const etiquetaProyeccion = `Quedará: ${formatearCantidad(restante)} ${unidad}`;
  // Mientras se escribe se respeta el texto; fuera de edición se muestra el valor acotado
  const valorCampo = editando ? texto : formatearCantidad(efectivo);

  return (
    <View style={styles.container}>
      <View style={styles.fila}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Restar"
          disabled={disabled}
          onPress={() => sumarPaso(-1)}
          style={({ pressed }) => [styles.paso, pressed && styles.pasoPresionado, disabled && styles.deshabilitado]}
        >
          <Text style={styles.pasoTexto}>−</Text>
        </Pressable>

        <TextInput
          accessibilityLabel="Cantidad a registrar"
          value={valorCampo}
          onChangeText={alEscribir}
          onFocus={() => {
            setTexto(formatearCantidad(efectivo));
            setEditando(true);
          }}
          onBlur={() => setEditando(false)}
          editable={!disabled}
          maxLength={11}
          keyboardType="numbers-and-punctuation"
          selectTextOnFocus
          style={[styles.campo, efectivo < 0 && styles.campoSalida, efectivo > 0 && styles.campoEntrada]}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sumar"
          disabled={disabled}
          onPress={() => sumarPaso(1)}
          style={({ pressed }) => [styles.paso, pressed && styles.pasoPresionado, disabled && styles.deshabilitado]}
        >
          <Text style={styles.pasoTexto}>+</Text>
        </Pressable>
      </View>

      <View style={styles.chips}>
        {incrementos.map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`Sumar ${n}. Mantén pulsado para restar ${n}`}
            disabled={disabled}
            onPress={() => sumarPaso(n)}
            onLongPress={() => sumarPaso(-n)}
            delayLongPress={350}
            style={({ pressed }) => [styles.chip, pressed && styles.pasoPresionado, disabled && styles.deshabilitado]}
          >
            <Text style={styles.chipTexto}>{`+${formatearCantidad(n)}`}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.ayuda}>Toca un chip para sumar; mantenlo pulsado para restar.</Text>

      <Text
        accessibilityLiveRegion="polite"
        style={[styles.proyeccion, restante <= 0 && styles.proyeccionCritica]}
      >
        {etiquetaProyeccion}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: theme.spacing.md },
  fila: { alignItems: "center", flexDirection: "row", gap: theme.spacing.md },
  paso: {
    alignItems: "center",
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.lg,
    height: 64,
    justifyContent: "center",
    minWidth: 64, // objetivo táctil ≥ 56 pt
    width: 64,
  },
  pasoPresionado: { opacity: 0.6 },
  pasoTexto: { color: theme.colors.primaryDark, fontSize: 34, fontWeight: "700", lineHeight: 38 },
  campo: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: 36,
    fontWeight: "800",
    minWidth: 130,
    paddingVertical: theme.spacing.sm,
    textAlign: "center",
  },
  campoSalida: { borderColor: theme.colors.error, color: theme.colors.error },
  campoEntrada: { borderColor: theme.colors.primaryDark, color: theme.colors.primaryDark },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, justifyContent: "center" },
  chip: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: theme.spacing.md,
  },
  chipTexto: { color: theme.colors.textPrimary, fontSize: theme.fontSize.md, fontWeight: "700" },
  ayuda: { color: theme.colors.textMuted, fontSize: theme.fontSize.xs },
  proyeccion: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, fontWeight: "600" },
  proyeccionCritica: { color: theme.colors.error },
  deshabilitado: { opacity: 0.4 },
});
