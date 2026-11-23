import { Ionicons } from "@expo/vector-icons";
import type { ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { theme } from "@/theme/theme";

type NombreIcono = keyof typeof Ionicons.glyphMap;

// Cada pantalla se declara de forma explícita: Expo Router solo muestra las rutas
// declaradas directamente como hijas del navegador (no las generadas con .map()).
function icono(normal: NombreIcono, activo: NombreIcono) {
  // `color` llega como ColorValue (puede ser null u opaco según la versión de tipos): se normaliza a string
  return function Icono({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    const tinte = typeof color === "string" ? color : theme.colors.primaryDark;
    return <Ionicons name={focused ? activo : normal} size={size} color={tinte} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primaryDark,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Dashboard", tabBarIcon: icono("stats-chart-outline", "stats-chart") }}
      />
      <Tabs.Screen
        name="inventario"
        options={{ title: "Inventario", tabBarIcon: icono("cube-outline", "cube") }}
      />
      <Tabs.Screen
        name="compras"
        options={{ title: "Compras", tabBarIcon: icono("cart-outline", "cart") }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Perfil", tabBarIcon: icono("person-outline", "person") }}
      />
    </Tabs>
  );
}
