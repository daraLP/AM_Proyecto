# Fase 1 · Análisis: Matriz de trazabilidad

> **POSCafé · Specs · Fase 1 · Análisis** · Índice general: [`../../README.md`](../../README.md)
> Trazabilidad **bidireccional** reconstruida desde el código. En la columna **Test** solo figuran pruebas que **existen**; «—» indica brecha (ver [`04-pruebas`](../../04-pruebas/diseno/01-piramide-y-matriz-de-pruebas.md)).

## 1. RF ↔ RN ↔ CU ↔ Componente / Servicio / RPC ↔ Test

| RF | Reglas | CU | Componente / Servicio / RPC / Ruta | Test (existente) |
|---|---|---|---|---|
| RF-01 | RN-09, RN-14, RN-19 | CU-05, CU-14 | `(auth)/login`, `(auth)/register`; `LoginScreen`, `RegisterScreen`; `services/auth.ts`; trigger `al_crear_usuario` / `manejar_nuevo_usuario` | pgTAP #1 (rol ignorado); `errores.test.ts` (mensajes de cuenta y sesión) — **sin pruebas de pantalla** |
| RF-02 | — | CU-14 | `lib/supabaseClient.ts` (`persistSession`, `autoRefreshToken`); `authStore.inicializar`; `services/auth.suscribirseACambiosAuth` | — (QA-12 manual) |
| RF-03 | — | — | **No implementado** (H-11) | — |
| RF-04 | RN-07 | — | `/(app)/(tabs)/dashboard`; `DashboardScreen`; `useDashboard`; `services/dashboard.ts`; RPC `resumen_dashboard`, `consumo_semanal` | — (H-01 sin cubrir) |
| RF-05 | RN-11 | — | `/inventario`; `InventarioListScreen`; `InsumoCard`; `useInsumos` (`useInfiniteQuery`); `listarInsumosPaginado`; `useDebounce` | — |
| RF-06 | RN-07 | CU-01 | `/inventario/[insumoId]`; `InsumoDetalleScreen`; `StockBadge`; `useInsumo`; `useMovimientos` | — |
| RF-07 | RN-01…05, RN-14, RN-15 | CU-01 | `QuickCounter`; `ReasonChips`; `/movimiento-modal` (`MovimientoModalScreen`); `useRegistrarMovimiento`; `services/movimientos.registrarMovimiento`; RPC `registrar_movimiento` → `private.aplicar_movimiento` | `QuickCounter.test.tsx`, `ReasonChips.test.tsx`, `utils.test.ts` (×2), `traducirError.test.ts`, pgTAP #3-#13, #15-#17 |
| RF-08 | RN-02, RN-11 | CU-01 | `useMovimientos(id, 5)`; `listarMovimientos`; tabla `movimientos_inventario` | — (parcial, H-10) |
| RF-09 | RN-03, RN-10, RN-11, RN-14, RN-16 | CU-06, CU-12 | `/inventario/form`, `/scan-modal`; `InsumoFormScreen`; `FotoInsumoScreen`; `services/insumos.ts`; `services/fotos.ts`; políticas `baristas_*` y `admin_escribe_insumos`; Storage `fotos-insumos` | pgTAP #14 (3), #17; `limites_de_entrada.test.sql`; `validacion.test.ts` |
| RF-10 | RN-10, RN-17 | CU-11 | `/compras/proveedor/[proveedorId]`; `ProveedorDetalleScreen`; `services/proveedores.ts`; `useGestionProveedores`; tabla `proveedor_insumos` | `limites_de_entrada.test.sql` (proveedor); — |
| RF-11 | RN-06, RN-08 | CU-03, CU-15 | `/compras`; `ListaComprasScreen`; `ShoppingItem`; `/confirmar-compra-modal`; `ConfirmarCompraScreen`; `useCompras`, `useComprarItem`, `useAgregarCompraManual`; `services/compras.ts`; RPC `comprar_item` | pgTAP #7-#9, #18-#21 |
| RF-12 | RN-13 | CU-04 | `SupplierMap`; `useUbicacion`; `useProveedoresCercanos`; `services/proveedores.proveedoresCercanos`; RPC `proveedores_cercanos` | pgTAP #23-#24; `utils.test.ts` (`formatearDistancia`) |
| RF-13 | RN-07, RN-12 | CU-02 | `lib/notifications.ts` (`registrarPush`, `desregistrarPush`); `usePushNotifications`; `services/pushTokens.ts`; tabla `push_tokens`; Edge Function `notify-low-stock`; trigger `insumos_stock_bajo` | pgTAP #7 (ítem auto); — (push extremo a extremo: QA-11 manual) |
| RF-14 | RN-10 | CU-08 | `/dashboard/reports`; `SoloAdmin`; `DashboardReportsScreen`; `obtenerConsumoPorInsumo`; RPC `consumo_por_insumo` | pgTAP #22 (acceso denegado a barista) |
| RF-15 | RN-14, RN-15 | CU-13 | `/perfil`; `PerfilScreen`; `useUiStore`; `useGestionUsuarios.actualizarNombre` | — |
| RF-16 | RN-10, RN-18 | CU-09 | `/perfil/usuarios`; `SoloAdmin`; `UsuariosScreen`; `services/perfiles.ts`; políticas `admin_gestiona_perfiles`; trigger `perfiles_proteger_rol` | pgTAP #2 |
| RF-17 | RN-10, RN-17 | CU-10 | `/perfil/categorias`; `SoloAdmin`; `CategoriasScreen`; `services/categorias.ts`; política `admin_escribe_categorias` | `limites_de_entrada.test.sql` (categoría 41) |
| RF-18 | — | CU-07 | `/dashboard/actividad`; `ActividadScreen`; `useActividad`; `listarActividad`; `utils/actividad.ts` | `actividad.test.ts`, `utils.test.ts` (actividad) |
| RF-19 | RN-13, RN-14 | CU-11 | `SelectorUbicacion`; `services/geocodificacion.ts` | `geocodificacion.test.ts` |
| RF-20 | RN-16 | CU-12 | `FotoInsumoScreen`; `useAvisoPermiso`; `subirFotoInsumo` | — |
| RF-21 | RN-06 | CU-15 | `ModalAgregarManual`; `agregarCompraManual`; política `insertar_lista_manual` | pgTAP: no cubre `insertar_lista_manual` |
| RF-22 | RN-04, RN-20 | CU-01 | `(app)/_layout.tsx` (banner); `useEstaOnline`; `lib/netinfo.ts`; `lib/queryClient.ts`; `AppProviders` | — (QA-13 manual) |

## 2. RN ↔ mecanismo ↔ prueba

| RN | Mecanismo BD | Mecanismo app | Prueba existente |
|---|---|---|---|
| RN-01 | `insumos_stock_chk`, `mov_saldo_chk`, `aplicar_movimiento` (`23514`) | `acotarDelta`, `QuickCounter`, `MovimientoModal` | `utils.test.ts` (×2 «delta / stock»), `utils_baseline`, `QuickCounter.test.tsx`; pgTAP #10-#11 |
| RN-02 | `aplicar_movimiento` | — | pgTAP #3-#6 (saldo) |
| RN-03 | `insumos_proteger_stock`; sin política `INSERT` en movimientos | servicios sin stock | pgTAP #13, #14, #17 |
| RN-04 | `mov_client_op_uidx` + búsqueda previa | `generarUuid`; reintento `23505` | pgTAP #15-#16; `utils.test.ts` (`generarUuid`) |
| RN-05 | CHECKs + validación RPC | `MOTIVOS`, `ReasonChips` | `ReasonChips.test.tsx`; pgTAP #12 |
| RN-06 | `lc_un_pendiente_por_insumo` | `agregarCompraManual` | pgTAP #8-#9 (automático) |
| RN-07 | `estado_stock`, `insumos_stock_bajo` | `StockBadge`, `estadoEsperado` | pgTAP #5-#7 |
| RN-08 | `comprar_item` | `ConfirmarCompraScreen` | pgTAP #18-#21 |
| RN-09 | `manejar_nuevo_usuario`, `perfiles_proteger_rol` | `signUp` sin rol | pgTAP #1-#2 |
| RN-10 | Políticas RLS | `useEsAdmin`, `SoloAdmin` | pgTAP #14, #22 |
| RN-11 | FK `RESTRICT`; sin UPDATE/DELETE en movimientos | `desactivarInsumo` | — |
| RN-12 | Webhook + `ON CONFLICT DO NOTHING` | Edge Function (`origen`) | pgTAP #7-#9 (no duplicado); — resto |
| RN-13 | `proveedores_cercanos` | listas/fichas | pgTAP #23-#24 |
| RN-14 | `CHECK … NOT VALID`, `mov_validar_delta` | `LIMITES`, `validar*` | `limites_de_entrada.test.sql`; `validacion.test.ts`; `utils_baseline` |
| RN-15 | — | `useUiStore.normalizar` | — |
| RN-16 | Bucket (2 MiB, MIME) | `subirFotoInsumo` | — |
| RN-17 | FKs sin cascada | mensajes de `eliminar*` | — |
| RN-18 | ❌ | botón deshabilitado | — |
| RN-19 | `manejar_nuevo_usuario` (`left(…,60)`) | `zod` + `normalizarTexto` | `validacion.test.ts` (`normalizarTexto`) |
| RN-20 | — | `queryClient` / `onlineManager` | — |

## 3. CU ↔ pantallas y rutas

| CU | Rutas Expo Router | Pantallas (`src/features`) |
|---|---|---|
| CU-01 | `/inventario/[insumoId]` → `/movimiento-modal` | `InsumoDetalleScreen`, `MovimientoModalScreen` |
| CU-02 | (deep link `/compras`) | — (BD + Edge Function) |
| CU-03 | `/compras` → `/confirmar-compra-modal` | `ListaComprasScreen`, `ConfirmarCompraScreen` |
| CU-04 | `/compras`, `/compras/proveedor/[proveedorId]` | `ListaComprasScreen`, `ProveedorDetalleScreen` |
| CU-05, CU-14 | `/login`, `/register`, `/` | `LoginScreen`, `RegisterScreen`, `PerfilScreen`, `ErrorPerfil` |
| CU-06 | `/inventario`, `/inventario/form`, `/inventario/[insumoId]` | `InventarioListScreen`, `InsumoFormScreen`, `InsumoDetalleScreen` |
| CU-07 | `/dashboard/actividad` | `ActividadScreen` |
| CU-08 | `/dashboard/reports` | `DashboardReportsScreen` |
| CU-09 | `/perfil/usuarios` | `UsuariosScreen` |
| CU-10 | `/perfil/categorias` | `CategoriasScreen` |
| CU-11 | `/compras/proveedor/[proveedorId]` (`nuevo`) | `ProveedorDetalleScreen`, `SelectorUbicacion` |
| CU-12 | `/scan-modal` | `FotoInsumoScreen` |
| CU-13 | `/perfil` | `PerfilScreen` |
| CU-15 | `/compras` (modal interno), `/compras/proveedor/[proveedorId]` | `ListaComprasScreen` (`ModalAgregarManual`), `ProveedorDetalleScreen` |

## 4. Brechas de trazabilidad (requisitos sin prueba automática)

RF-01 (pantallas), RF-02, RF-04, RF-05, RF-06, RF-08, RF-10, RF-13 (push), RF-15, RF-20, RF-21, RF-22; RN-11, RN-15, RN-16, RN-17, RN-18, RN-20. Detalle y plan en [`04-pruebas/tareas.md`](../../04-pruebas/tareas.md).
