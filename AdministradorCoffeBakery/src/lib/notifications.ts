import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { eliminarPushToken, guardarPushToken } from "../services/pushTokens";

export const CANAL_ALERTAS = "stock-alerts";

// En primer plano también se muestra el aviso
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let tokenActual: string | null = null;

function obtenerProjectId(): string | undefined {
  const id =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  return typeof id === "string" && !id.startsWith("REEMPLAZA") ? id : undefined;
}

// DEV-19: permisos → token Expo → upsert en push_tokens. Nunca lanza: el push es opcional.
export async function registrarPush(usuarioId: string): Promise<void> {
  try {
    if (!Device.isDevice) return; // los simuladores no reciben push

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CANAL_ALERTAS, {
        name: "Alertas de stock",
        // eslint-disable-next-line import/namespace -- falso positivo: el enum existe en los tipos de expo-notifications
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const actuales = await Notifications.getPermissionsAsync();
    let estado = actuales.status;
    if (estado !== "granted") {
      estado = (await Notifications.requestPermissionsAsync()).status;
    }
    if (estado !== "granted") return;

    const projectId = obtenerProjectId();
    if (!projectId) {
      console.warn("Push desactivado: falta extra.eas.projectId en app.json.");
      return;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    tokenActual = token;
    await guardarPushToken({ usuarioId, token, plataforma: Platform.OS });
  } catch (error) {
    console.warn("No se pudo registrar el push:", error);
  }
}

// Limpieza al cerrar sesión (spec: se elimina el token del dispositivo)
export async function desregistrarPush(): Promise<void> {
  if (!tokenActual) return;
  const token = tokenActual;
  tokenActual = null;
  await eliminarPushToken(token);
}
