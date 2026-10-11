# Fase 3 · Desarrollo: Notificaciones push

> **POSCafé · Specs · Fase 3 · Desarrollo** · Índice general: `docs/specs/README.md`


| Pieza | Especificación |
|---|---|
| Registro | Tras el login: permisos → `getExpoPushTokenAsync({projectId})` → `upsert` en `push_tokens` (`usuario_id`, `token`, `plataforma`) |
| Canal Android | `stock-alerts`, importancia alta |
| Envío | Database Webhook (`lista_compras`, `INSERT`) → Edge Function `notify-low-stock` (valida `x-webhook-secret`, filtra `origen = 'auto'`, envía a Expo Push) |
| Mensaje | «Stock bajo: {nombre}» o «Agotado: {nombre}» + cantidad restante |
| Deep link | Al tocar, navega a la pestaña Compras |
| Limpieza | Al cerrar sesión se elimina el token; la Edge Function elimina tokens con `DeviceNotRegistered` |
