import { Stack } from "expo-router";
import { opcionesStackConEncabezado } from "@/components/Encabezado";

export default function PerfilLayout() {
  return (
    <Stack screenOptions={opcionesStackConEncabezado}>
      <Stack.Screen name="index" options={{ title: "Perfil" }} />
      <Stack.Screen name="usuarios" options={{ title: "Usuarios y roles" }} />
      <Stack.Screen name="categorias" options={{ title: "Categorías" }} />
    </Stack>
  );
}
