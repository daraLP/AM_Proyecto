import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { registrarPush } from "../lib/notifications";

// Registra el token tras el login y lleva a Compras al tocar una alerta (deep link)
export function usePushNotifications(usuarioId: string | undefined) {
  const router = useRouter();

  useEffect(() => {
    if (usuarioId) void registrarPush(usuarioId);
  }, [usuarioId]);

  useEffect(() => {
    const abrir = (respuesta: Notifications.NotificationResponse) => {
      const ruta = respuesta.notification.request.content.data?.route;
      router.push(typeof ruta === "string" && ruta.startsWith("/") ? (ruta as never) : "/compras");
    };

    // App abierta desde una notificación con la app cerrada
    const inicial = Notifications.getLastNotificationResponse();
    if (inicial) abrir(inicial);

    const suscripcion = Notifications.addNotificationResponseReceivedListener(abrir);
    return () => suscripcion.remove();
  }, [router]);
}
