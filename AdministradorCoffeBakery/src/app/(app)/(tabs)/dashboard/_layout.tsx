import { Stack } from "expo-router";
import { opcionesStackConEncabezado } from "@/components/Encabezado";

export default function DashboardLayout() {
  return (
    <Stack screenOptions={opcionesStackConEncabezado}>
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="reports" options={{ title: "Reporte de consumo" }} />
      <Stack.Screen name="actividad" options={{ title: "Actividad del equipo" }} />
    </Stack>
  );
}
