# Fase 3 · Desarrollo: Tareas

> **POSCafé · Specs · Fase 3 · Desarrollo** · Índice general: [`../README.md`](../README.md)
> Leyenda: ✅ hecho y verificable · 🔄 parcial · ⬜ no encontrado · 🆕 derivada del código.

| ID | Tarea | Estado | Evidencia |
|---|---|---|---|
| V-01 | Proyecto Expo con TypeScript, Expo Router y alias `@/` | ✅ | `package.json`, `tsconfig.json` |
| V-02 | Cliente Supabase y variables `EXPO_PUBLIC_*` | ✅ | `src/lib/supabaseClient.ts`, `.env.example` (contenido ❔) |
| V-03 | Autenticación (login, registro, cierre de sesión) y `useAuthStore` | ✅ | `features/auth` |
| V-04 | Layouts, guardas y `SoloAdmin` | ✅ | [Navegación](../02-diseno/diseno/06-navegacion-con-expo-router-y-guardas-por-rol.md) |
| V-05 | Inventario: lista paginada, filtros, detalle, formulario, foto | ✅ | [Inventario](diseno/02-pantalla-de-inventario-lista-paginada-y-filtros.md) |
| V-06 | QuickCounter, ReasonChips y modal de movimiento | ✅ | [QuickCounter](diseno/01-quickcounter-stepper-chips.md) |
| V-07 | Caché persistida, cola offline y `onlineManager` | ✅ | `queryClient.ts`, `AppProviders.tsx` |
| V-08 | Lista de compras y confirmación | ✅ | [Compras](diseno/03-lista-de-compras-y-mapa-de-proveedores.md) |
| V-09 | Proveedores, selector de ubicación y mapa | ✅ | idem |
| V-10 | Notificaciones push y Edge Function | 🔄 | [Push](diseno/04-notificaciones-push.md); webhook no versionado |
| V-11 | Dashboard, actividad y reportes | 🔄 | [Dashboard](diseno/05-dashboard.md); H-01 |
| V-12 | Realtime | ✅ | `useRealtime.ts`; migración `20261020000000_realtime_movimientos.sql` |
| V-13 | Sistema de feedback (toasts y diálogos) | ✅ | `FeedbackProvider`, `Feedback.test.tsx` |
| V-14 | Gestión de usuarios y categorías | ✅ | `UsuariosScreen`, `CategoriasScreen` |
| V-15 🆕 | Límites de entrada (`LIMITES`) y migración | ✅ | `validacion.ts`, `20261122000000` |
| V-16 🆕 | Permisos ampliados de barista (ADR-08) | ✅ | `20261015000000`, `InsumoFormScreen` |
| V-17 🆕 | Encabezado JS propio para iOS/Android | ✅ | `Encabezado.tsx`, `Encabezado.test.tsx` |
| V-18 🆕 | Ajustes de `NetInfo` contra falsos «sin conexión» | ✅ | `netinfo.ts` |
| V-19 | Recuperación de contraseña | ⬜ | H-11 |
| V-20 | Historial completo | ⬜ | H-10 |
| V-21 | Corrección de etiqueta del gráfico semanal | ⬜ | H-01 |
| V-22 | Eliminar dependencia residual de React Navigation | ⬜ | H-17 |
| V-23 | Sustituir `scan-modal` por un nombre de ruta acorde (`foto-modal`) | ⬜ | Cambio de ruta tipada |
