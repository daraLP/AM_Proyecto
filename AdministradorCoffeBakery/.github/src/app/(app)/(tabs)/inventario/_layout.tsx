import { Stack } from "expo-router";
import { opcionesStackConEncabezado } from "@/components/Encabezado";

export default function InventarioLayout() {
  return (
    <Stack screenOptions={opcionesStackConEncabezado}>
      <Stack.Screen name="index" options={{ title: "Inventario" }} />
      <Stack.Screen name="[insumoId]" options={{ title: "Insumo" }} />
      <Stack.Screen name="form" options={{ title: "Insumo" }} />
    </Stack>
  );
}
