import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";
import { NativeStackHeaderProps, Stack } from "../../.expo/types/router";
import { ComponentProps } from "react";
const ALTO_BARRA = 52;

// Encabezado propio (JS, dentro del flujo del layout). La barra nativa de iOS 26 es «de cristal»
// y deja que el contenido pase por debajo; este ocupa su espacio de forma igual en iOS y Android.
// Se encarga de la barra de estado (inset superior), por eso las pantallas que lo usan
// ponen su SafeAreaView con edges ["bottom", "left", "right"].
export function Encabezado({
  options,
  route,
  back,
  navigation,
}: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const titulo = typeof options.title === "string" ? options.title : route.name;

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <View style={styles.barra}>
        <View style={styles.lado}>
          {back ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={12}
              onPress={() => navigation.goBack()}
              style={styles.atras}
            >
              <Ionicons
                name="chevron-back"
                size={26}
                color={theme.colors.primaryDark}
              />
              <Text style={styles.atrasTexto} numberOfLines={1}>
                {back.title ?? "Atrás"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <Text
          accessibilityRole="header"
          style={styles.titulo}
          numberOfLines={1}
        >
          {titulo}
        </Text>

        <View style={styles.lado} />
      </View>
    </View>
  );
}

export const opcionesStackConEncabezado = {
  header: (props: NativeStackHeaderProps) => <Encabezado {...props} />,
} as unknown as ComponentProps<typeof Stack>["screenOptions"];

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  barra: {
    alignItems: "center",
    flexDirection: "row",
    height: ALTO_BARRA,
    paddingHorizontal: theme.spacing.sm,
  },
  lado: { flex: 1, justifyContent: "center" },
  atras: { alignItems: "center", flexDirection: "row", minHeight: 44 },
  atrasTexto: {
    color: theme.colors.primaryDark,
    flexShrink: 1,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  titulo: {
    color: theme.colors.textPrimary,
    flex: 2,
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    textAlign: "center",
  },
});
