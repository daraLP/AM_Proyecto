# Fase 3 · Desarrollo: Tareas

> **POSCafé · Specs · Fase 3 · Desarrollo** · Índice general: `docs/specs/README.md`


Dependencias principales: DEV-01 → DEV-02 → (DEV-05…DEV-24). Las tareas de datos (DEV-03, DEV-04) preceden a los hooks.

| ID | Tarea | Estado | Depende de | Definition of Done |
|---|---|---|---|---|
| DEV-01 | Cliente Supabase único con sesión persistente (AsyncStorage, `autoRefreshToken`) y *polyfill* de URL | 🔄 | ADR-03 | Una sola instancia; sesión se mantiene al reabrir |
| DEV-02 | `authStore` (sin `rol` en `signUp`, sin `await` en `onAuthStateChange`) y guard de rutas | 🔄 | DEV-01 | Login/registro funcionan; el perfil carga sin bloqueos |
| DEV-03 | Capa de servicios: `insumos`, `movimientos`, `compras`, `proveedores`, `dashboard` | 🔄 | D-04 | Sin acceso a Supabase fuera de `services/` |
| DEV-04 | `queryClient` + persistencia + `onlineManager` (NetInfo) | ⬜ | ADR-02 | Lectura offline y mutaciones pausadas |
| DEV-05 | Componente `QuickCounter` | ⬜ | D-09 | Cumple las reglas de §3.2 |
| DEV-06 | Componente `ReasonChips` y constante `MOTIVOS` | 🔄 | n/a | Los valores coinciden con el CHECK |
| DEV-07 | Hook `useRegistrarMovimiento` (optimista, rollback, `opId`) | ⬜ | DEV-03, DEV-04 | Error revierte el stock mostrado |
| DEV-08 | Pantalla `InsumoDetalle` + `MovimientoModal` + historial | ⬜ | DEV-05…07 | CA-01 y CA-02 |
| DEV-09 | Servicio y hook del Dashboard (`services/dashboard.ts`, `hooks/useDashboard.ts`) | 🔄 | DEV-03 | Existen; validar contra `resumen_dashboard` y `consumo_semanal` y pasar a TanStack Query |
| DEV-10 | Pantalla Dashboard (`DashboardScreen`: tarjetas + gráfico semanal) | 🔄 | DEV-09 | Existe; validar datos reales y estados vacío/error |
| DEV-11 | `InventarioListScreen` paginada con filtros y búsqueda | 🔄 | DEV-03 | Scroll infinito, filtros y botones por rol |
| DEV-12 | `InsumoFormScreen`: crear con stock inicial por movimiento; editar sin `stock_actual` | 🔄 | DEV-03 | Sin errores `42501` |
| DEV-13 | CRUD de proveedores + asociación con insumos + coordenadas | ⬜ | DEV-03 | Admin gestiona proveedores |
| DEV-14 | CRUD de categorías y subida de foto a `fotos-insumos` | ⬜ | DEV-03 | `foto_url` guardada |
| DEV-15 | Pantalla de Lista de Compras (`ListaComprasScreen`: checkboxes y manual) | 🔄 | DEV-03 | Existe; implementar contra `lista_compras` y CA-05 |
| DEV-16 | `ConfirmarCompraModal` + `comprar_item` | ⬜ | DEV-15 | CA-05 y CA-06 |
| DEV-17 | Hook `useProveedoresCercanos` + permisos de ubicación | ⬜ | DEV-03 | CA-09 y CA-10 |
| DEV-18 | `SupplierMap` y `ProveedorDetalle` | ⬜ | DEV-17 | Marcadores y distancia |
| DEV-19 | Registro de push token y manejador de notificaciones | ⬜ | DEV-02 | Token guardado |
| DEV-20 | Edge Function `notify-low-stock` + secretos + despliegue | ⬜ | DEV-19 | Push de prueba recibido |
| DEV-21 | Database Webhook sobre `lista_compras` | ⬜ | DEV-20 | CA-03 |
| DEV-22 | Pantalla de Reportes (`DashboardReportsScreen`, admin) con `consumo_por_insumo` | 🔄 | DEV-03 | Existe; envolver en `SoloAdmin` y agregar rango de fechas |
| DEV-23 | Pantalla de Perfil (`PerfilScreen`): datos, incrementos rápidos (Zustand + persist), cerrar sesión | 🔄 | DEV-02 | Existe; agregar preferencias persistentes |
| DEV-24 | Gestión de usuarios y roles (admin) | ⬜ | DEV-03 | Cambio de rol funciona |
| DEV-25 | Realtime sobre `insumos` y `lista_compras` | ⬜ | DEV-04 | La lista se refresca sola |
| DEV-26 | `app.config.ts`, `eas.json`, permisos y claves de mapas | ⬜ | n/a | Build de desarrollo instala |
| DEV-27 | Builds EAS (`development`, `preview`, `production`) y secretos | ⬜ | DEV-26 | APK de `preview` funcional |
| DEV-28 | Limpiar duplicados: cliente único ya confirmado; eliminar `/types/supabase.ts` tras mover los tipos | 🔄 | D-16 | Sin referencias huérfanas |
| DEV-29 | `providers/AppProviders.tsx`: `QueryClientProvider` con persistencia (AsyncStorage) y `onlineManager` | ⬜ | DEV-04 | Caché sobrevive al reinicio |
| DEV-30 | Componentes compartidos: `PantallaCarga`, `EmptyState`, `ErrorState`, `SoloAdmin`, `StockBadge` | ⬜ | D-14 | Usados por todas las pantallas |
| DEV-31 | Servicios nuevos: `compras.ts`, `proveedores.ts`, `perfiles.ts` (gestión de usuarios) | ⬜ | D-04 | Sin Supabase fuera de `services/` |
| DEV-32 | Pantalla de gestión de usuarios y roles (`perfil/usuarios`, solo administrador) | ⬜ | DEV-31 | El administrador cambia roles; barista no accede |

**Comandos de referencia**

```bash
npx expo install expo-notifications expo-location expo-device expo-constants react-native-maps \
  @react-native-async-storage/async-storage @react-native-community/netinfo expo-haptics \
  expo-image-picker expo-image-manipulator
npm i @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-async-storage-persister
npx supabase functions deploy notify-low-stock
npx supabase secrets set WEBHOOK_SECRET=<secreto>
eas build --profile development --platform android
eas build --profile preview --platform android
```
