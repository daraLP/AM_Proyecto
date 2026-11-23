# Estado actual del proyecto

> **POSCafé · Specs · Contexto** · Índice general: [`../README.md`](../README.md)
> **Reconstruido el 2026-11-22** por ingeniería inversa del volcado de código (`Codigo.txt`) y contrastado con la idea original y los ADR históricos (`Decisiones de arquitectura (ADR).txt`, marcados por el propio autor como «documentación desactualizada»).

## 1. Resumen ejecutivo

POSCafé es una app móvil (Expo Router + React Native + TypeScript) para administrar el inventario de insumos de una cafetería, con **Supabase** como backend (PostgreSQL con RLS, RPC `SECURITY DEFINER`, triggers, Realtime, Storage y una Edge Function). El flujo diferenciador es el **contador rápido** (`QuickCounter` → `/movimiento-modal` → RPC `registrar_movimiento`).

| Dimensión | Estado |
|---|---|
| Aplicación | Funcional de punta a punta: auth, dashboard, inventario, detalle + contador, compras, mapa, proveedores, reportes, perfil, usuarios, categorías, actividad del equipo |
| Base de datos | 5 migraciones versionadas; 8 tablas con RLS; 14 funciones (8 públicas + 6 privadas); 6 triggers; 8 índices; 3 tablas en Realtime |
| Notificaciones | Cliente (registro de token, deep link) y Edge Function `notify-low-stock` implementados; **webhook de BD no versionado** (H-06) |
| Pruebas | 13 archivos Jest (9 en `__tests__/`, 4 en `tests/`); 2 suites pgTAP (`plan(26)` y `plan(7)`); 1 script `pgbench`. **Sin** pruebas de guardas de rutas ni de hooks (H-14) |
| CI | `.github/workflows/ci.yml` aparece en el árbol, pero su contenido no estaba en el volcado (H-06) |

## 2. Inventario del repositorio (según el árbol aportado)

| Carpeta / archivo | Contenido | Estado |
|---|---|---|
| `src/app/` | Rutas Expo Router: `_layout`, `index`, `(auth)`, `(app)/(tabs)` (4 tabs con stacks) y 3 modales | ✅ |
| `src/components/` | `Aviso`, `Boton`, `EmptyState`, `Encabezado`, `ErrorPerfil`, `ErrorState`, `InsumoCard`, `PantallaCarga`, `QuickCounter`, `ReasonChips`, `SelectorUbicacion`, `ShoppingItem`, `SoloAdmin`, `StockBadge`, `SupplierMap`, `feedback/tipos.ts` | ✅ |
| `src/features/` | `auth` (4 pantallas + `authStore`), `dashboard` (3), `insumos` (4), `listaCompras` (2), `movimientos` (1), `proveedores` (1) | ✅ |
| `src/hooks/` | 13 hooks (`useActividad`, `useAvisoPermiso`, `useCatalogos`, `useCompras`, `useDashboard`, `useDebounce`, `useEstaOnline`, `useInsumos`, `useMovimientos`, `useProveedoresCercanos`, `usePushNotifications`, `useRealtime`, `useUbicacion`) | ✅ |
| `src/services/` | 11 servicios (`auth`, `categorias`, `compras`, `dashboard`, `fotos`, `geocodificacion`, `insumos`, `movimientos`, `perfiles`, `proveedores`, `pushTokens`) | ✅ |
| `src/lib/` | `supabaseClient`, `queryClient`, `netinfo`, `notifications` | ✅ |
| `src/providers/` | `AppProviders`, `FeedbackProvider` | ✅ |
| `src/store/` | `uiStore.ts` (`useUiStore`); el `useAuthStore` vive en `src/features/auth/authStore.ts` | ✅ |
| `src/utils/` | `actividad`, `delta`, `envioUnico`, `errores`, `formato`, `uuid`*, `validacion` | ✅ |
| `src/types/` | `database.types.ts` (generado) y `database.ts` (dominio) | ✅ |
| `src/theme/` | `theme.ts` | ✅ |
| `supabase/migrations/` | 5 migraciones (ver §3) | ✅ |
| `supabase/functions/notify-low-stock/` | `index.ts`, `deno.json`, `deno.lock` | ✅ |
| `supabase/tests/` | `database/rls_y_stock.test.sql`, `database/limites_de_entrada.test.sql`, `concurrencia.pgbench.sql` | ✅ |
| `supabase/seed.sql` | Datos de prueba (Ensenada, B.C.) | ✅ |
| `tests/`, `__tests__/` | Pruebas Jest | ✅ |
| `docs/` | `origen/`, `specs/`, `feedback.md`, `README.md`, `SDD_POSCafe.md`, `SDD_POSCafé.md` | 🔄 desactualizados |
| `android/` | Proyecto nativo generado (`com.poscafe.app`) | ✅ (generado) |
| Raíz | `app.json`, `eas.json`, `eslint.config.js`, `jest.app.config.js`, `jest.config.js`, `jest.setup.js`, `tsconfig.json`, `package.json`, `.env`, `.env.example`, `CAMBIOS.md`, `README.md` | ✅ |

\* En el árbol el archivo es `src/utils/uuid.ts` (función `generarUuid`; en el volcado el contenido aparece junto a `formato.ts`).

**Ya no existen** (resuelto respecto a los documentos históricos): `App.tsx`, `index.ts` clásico, `src/navigation/*` (React Navigation), la carpeta `types/` en la raíz y el cliente Supabase duplicado.

## 3. Migraciones (orden cronológico real)

| Archivo | Alias histórico | Contenido |
|---|---|---|
| `20261001000000_esquema_base.sql` | 0001 | 7 tablas base (`perfiles`, `categorias`, `proveedores`, `insumos`, `proveedor_insumos`, `movimientos_inventario`, `lista_compras`), `manejar_nuevo_usuario` + trigger `al_crear_usuario`, RLS habilitado sin políticas |
| `20261010000000_endurecimiento_poscafe.sql` | 0002 | Esquema `private`; `es_admin`; RLS completo; triggers de protección; `aplicar_movimiento`, `registrar_movimiento`, `comprar_item`; `proveedores_cercanos`, `resumen_dashboard`, `consumo_semanal`, `consumo_por_insumo`; tabla `push_tokens`; bucket `fotos-insumos`; Realtime (`insumos`, `lista_compras`) |
| `20261015000000_baristas_editan_insumos.sql` | 0003 | **ADR-08:** baristas crean/editan insumos; baristas suben/reemplazan fotos |
| `20261020000000_realtime_movimientos.sql` | 0004 | `movimientos_inventario` a la publicación `supabase_realtime` |
| `20261122000000_limites_de_entrada.sql` | 0005 | `CHECK … NOT VALID` de longitudes y rangos; `manejar_nuevo_usuario` recorta el nombre a 60; trigger `mov_validar_delta` (tope 999 999, errcode `22003`) |

> ⚠️ **Evolución de numeración:** los documentos históricos llaman «migración 0003» a una mejora *propuesta* de idempotencia (no implementada). En el repo real, la 0003 es la de baristas (`20261015000000`).

## 4. Hallazgos de la ingeniería inversa

Cada hallazgo es una discrepancia, deuda técnica o riesgo observable **en el código aportado**. La severidad es una estimación del impacto, no una medición.

| ID | Hallazgo | Evidencia | Impacto |
|---|---|---|---|
| **H-01** | **Etiquetas del gráfico semanal incorrectas.** `label: registro.dia.slice(0, 3)` se aplica a `dia`, que es un `date` de PostgreSQL (llega como `"2026-11-22"`); las tres primeras letras son `"202"` para todas las barras. | `src/features/dashboard/DashboardScreen.tsx` ↔ `public.consumo_semanal` (`dia date`) | Media (UX). Verificar en dispositivo; corregir formateando el día de la semana |
| **H-02** | **Insumo creado sin stock pero con mínimo > 0** queda `agotado` sin ítem automático ni push: `insumos_stock_bajo` es `AFTER UPDATE OF stock_actual, stock_minimo`, no hay trigger `AFTER INSERT`. Solo se corrige al siguiente movimiento o edición del mínimo. (Tarea histórica A-07 sin resolver.) | `20261010000000…sql` §5.3; `crearInsumo` | Media (RN-07 incompleta) |
| **H-03** | **`INSERT` con `stock_actual > 0` por administrador no genera movimiento:** `insumos_proteger_stock` solo protege `UPDATE`. La app no lo hace (el seed sí, a propósito). | trigger `insumos_proteger_stock`; política `admin_escribe_insumos` | Baja (requiere cliente modificado) |
| **H-04** | **Carrera de idempotencia:** `aplicar_movimiento` consulta `client_op_id` antes de `FOR UPDATE`; dos solicitudes idénticas simultáneas hacen que la segunda falle con `23505`. No hay doble aplicación (la transacción se revierte). El cliente compensa: ante `23505` con `opId` espera 400 ms y repite **una** vez. | `private.aplicar_movimiento`; `services/movimientos.ts` | Baja |
| **H-05** | **Bucket de fotos público** (`public = true`, `getPublicUrl`); las fotos reemplazadas no se eliminan (`upsert: false`, ruta `${insumoId}/${Date.now()}.jpg`). | migración 0002; `services/fotos.ts` | Baja (privacidad leve; crecimiento de Storage) |
| **H-06** | **Elementos no versionados o no incluidos en el volcado:** Database Webhook `lista_compras INSERT → notify-low-stock`, secretos (`WEBHOOK_SECRET`), `supabase/config.toml`, `.github/workflows/ci.yml`, `.gitignore`, `.env.example`, `CAMBIOS.md`. | árbol vs. volcado | ❔ No verificable. Sin el webhook **no hay push** |
| **H-07** | **«Un administrador no se degrada a sí mismo» es solo de UI** (`disabled={soyYo}`). `perfiles_proteger_rol` permite al administrador cambiar cualquier rol, incluido el propio; vía API se podría dejar el sistema sin administradores. | `UsuariosScreen`; `private.proteger_rol` | Baja–Media |
| **H-08** | **Zona horaria fija** `America/Mexico_City` en `consumo_semanal`; la app no pasa `p_tz`. El seed apunta a Ensenada (zona del Pacífico). | firma de la función; `obtenerConsumoSemanal` | Baja (cortes de día desfasados) |
| **H-09** | **Radio por defecto inconsistente:** SQL `p_radio_km default 10`; servicio `proveedoresCercanos` envía `radioKm ?? 25`. | `proveedores_cercanos`; `services/proveedores.ts` | Baja |
| **H-10** | **Historial acotado:** el detalle muestra los últimos **5** movimientos del insumo (`useMovimientos(insumoId, 5)`) y «Actividad del equipo» los últimos **50**. No hay pantalla de historial completo/paginado, aunque la idea original pide «historial completo para su posterior consulta». | `InsumoDetalleScreen`, `useActividad(50)` | Media (RF-08 parcial) |
| **H-11** | **Recuperación de contraseña (RF-03) no implementada:** no hay pantalla ni servicio. | `src/features/auth/*`, `services/auth.ts` | Baja (prioridad C) |
| **H-12** | **Push a todos los dispositivos registrados**, sin distinguir rol ni usuario: la Edge Function lee todos los `push_tokens` con `service_role`. | `notify-low-stock/index.ts` | Informativo (coincide con CU-02 histórico) |
| **H-13** | **Posible mala clasificación de errores `23514`:** `clasificar()` devuelve `stockInsuficiente` si el mensaje contiene «stock». Un `CHECK` como `insumos_stock_max_chk` (entrada que supera 999 999) incluye «stock» en el nombre de la constraint, por lo que el usuario vería «No hay suficiente stock para esa salida» para una **entrada**. Las pruebas usan mensajes sin nombre de constraint. | `src/utils/errores.ts` (`clasificar`, `codigoDeError`); migración 0005 | Baja–Media |
| **H-14** | **Brechas de prueba:** sin pruebas de guardas de Expo Router, de `useRegistrarMovimiento`, de Login/Register ni de las pantallas por rol; el script `pgbench` existe pero no hay resultados registrados. | `__tests__/`, `tests/`, `supabase/tests/` | Media |
| **H-15** | **Import frágil:** `Encabezado.tsx` importa `NativeStackHeaderProps` y `Stack` desde `"../../.expo/types/router"` (artefacto generado dentro de `.expo/`). | `src/components/Encabezado.tsx` | Baja (rompe si `.expo/` se regenera/ignora) |
| **H-16** | **`aplicar_movimiento` no valida el tope superior del stock resultante** antes del `UPDATE`: una entrada que lleve el stock a > 999 999 falla por el `CHECK insumos_stock_max_chk` (23514), no por una validación explícita; el `acotarDelta` del cliente solo acota la cantidad (≤ 999 999), no `stock + delta`. | `delta.ts`; migración 0005 | Baja |
| **H-17** | **Dependencia residual:** `@react-navigation/native-stack` sigue en `package.json` (solo se usan sus tipos en `Encabezado`). | `package.json` | Informativo |
| **H-18** | **Cola offline limitada a movimientos:** `comprar_item`, altas y ediciones fallan sin conexión (ADR-10). No es un defecto, pero RNF-02 histórico podía leerse como más amplio. | `queryClient.ts` | Informativo |
| **H-19** | **`npm test` no ejecuta `__tests__/`:** el script es `jest --ci -c jest.app.config.js` y ese archivo solo tiene `testMatch: ["<rootDir>/tests/**/*.test.ts"]` (sin `.tsx`). Las pruebas de componentes (`QuickCounter`, `ReasonChips`, `Feedback`, `Encabezado`) y las de `actividad`, `errores`, `geocodificacion`, `traducirError` y `utils` de `__tests__/` solo corren con `jest.config.js` (`npx jest`), que incluye ambas carpetas. Si el CI usa `npm test`, esas pruebas no se ejecutan (contenido de `ci.yml` no verificable). | `package.json`; `jest.app.config.js`; `jest.config.js` | Media |

## 5. Estado funcional por módulo

| Módulo | Pantallas / piezas | Estado | Observaciones |
|---|---|---|---|
| Autenticación | `LoginScreen`, `RegisterScreen`, `authStore`, `services/auth.ts`, guardas `(auth)`/`(app)` | ✅ | Sesión persistente (AsyncStorage + `autoRefreshToken`); perfil con reintentos ante desfase de reloj; limpia caché al cambiar de usuario |
| Contador rápido | `QuickCounter`, `ReasonChips`, `MovimientoModalScreen`, `useRegistrarMovimiento` | ✅ | Optimista, rollback, `opId`, cola offline |
| Inventario | `InventarioListScreen`, `InsumoCard`, `InsumoDetalleScreen`, `InsumoFormScreen`, `FotoInsumoScreen` | ✅ | Paginación 20, debounce 300 ms, filtros categoría/estado |
| Compras | `ListaComprasScreen`, `ShoppingItem`, `ConfirmarCompraScreen`, alta manual | ✅ | `comprar_item` idempotente; un pendiente por insumo |
| Proveedores y mapa | `SupplierMap`, `ProveedorDetalleScreen`, `SelectorUbicacion`, `useUbicacion`, `useProveedoresCercanos` | ✅ | Geocodificación del sistema; permiso «en uso» |
| Dashboard | `DashboardScreen`, `DashboardReportsScreen`, `ActividadScreen` | 🔄 | H-01 (etiquetas); reportes solo admin |
| Perfil y administración | `PerfilScreen`, `UsuariosScreen`, `CategoriasScreen` | ✅ | H-07 |
| Push | `lib/notifications.ts`, `usePushNotifications`, `pushTokens`, Edge Function | 🔄 | Webhook no verificable (H-06) |
| Realtime | `useRealtimeInvalidacion` | ✅ | 3 tablas |
| Pruebas | Jest, pgTAP, pgbench | 🔄 | H-14 |
| CI/CD | `ci.yml`, `eas.json` | 🔄 | `ci.yml` no verificable |

## 6. Cómo leer el resto de `specs/`

1. [`adr.md`](adr.md) y [`convenciones.md`](convenciones.md) para el contexto.
2. [`../01-analisis/requerimientos.md`](../01-analisis/requerimientos.md) para RN, RF y RNF reales.
3. [`../02-diseno/diseno/`](../02-diseno/diseno/) para esquema, RLS, contratos y navegación.
4. [`../03-desarrollo/diseno/`](../03-desarrollo/diseno/) para el detalle de cada módulo.
5. [`../04-pruebas/diseno/`](../04-pruebas/diseno/) para las pruebas existentes y las brechas.
