import { Stack } from "expo-router";
import { opcionesStackConEncabezado } from "@/components/Encabezado";

export default function ComprasLayout() {
  return (
    <Stack screenOptions={opcionesStackConEncabezado}>
      <Stack.Screen name="index" options={{ title: "Compras" }} />
      <Stack.Screen name="proveedor/[proveedorId]" options={{ title: "Proveedor" }} />
    </Stack>
  );
}
