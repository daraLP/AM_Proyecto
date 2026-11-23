# Fase 3 · Desarrollo: Requerimientos de implementación

> **POSCafé · Specs · Fase 3 · Desarrollo** · Índice general: [`../README.md`](../README.md)
> Requerimientos de implementación (RDV) que el código satisface. Los RF/RN de origen están en [`../01-analisis/requerimientos.md`](../01-analisis/requerimientos.md).

| ID | Requerimiento de desarrollo | Módulo / evidencia | Estado |
|---|---|---|---|
| RDV-01 | Stack: Expo 58, React Native 0.88, React 19, TypeScript estricto, Expo Router con `typedRoutes`. | `package.json`, `app.json`, `tsconfig.json` | ✅ |
| RDV-02 | Alias de importación `@/` → `src/`. | `tsconfig.json`, `jest.config.js` (`moduleNameMapper`) | ✅ |
| RDV-03 | Tipos de BD generados (`database.types.ts`) y tipos de dominio (`database.ts`). | `src/types` | ✅ |
| RDV-04 | Rendimiento de listas: `FlatList`, `React.memo`, `useCallback`, *debounce* 300 ms. | `InventarioListScreen`, `InsumoCard`, `ShoppingItem` | ✅ |
| RDV-05 | Paginación infinita de 20 elementos con filtros en servidor. | `useInsumos`, `listarInsumosPaginado` | ✅ |
| RDV-06 | Estados de carga/error/vacío en cada pantalla con datos remotos. | `PantallaCarga`, `ErrorState`, `EmptyState` | ✅ |
| RDV-07 | Actualización optimista con *rollback* en el contador. | `useRegistrarMovimiento` | ✅ |
| RDV-08 | Cola offline persistente de `registrar_movimiento` con reanudación al reconectar. | `queryClient.ts`, `AppProviders`, `netinfo.ts` | ✅ |
| RDV-09 | Idempotencia generada en cliente (`generarUuid` en `useRef`) para movimiento y compra. | `MovimientoModalScreen`, `ConfirmarCompraScreen` | ✅ |
| RDV-10 | Anti-doble toque en todos los botones. | `Boton`, `crearBloqueo` | ✅ |
| RDV-11 | Validación de entradas con `LIMITES` y `zod`; helpers `validarTexto`, `validarCantidad`, `validarTelefono`, `validarCorreo`, `filtrarEntradaNumerica`. | `utils/validacion.ts` | ✅ |
| RDV-12 | Mensajes de error en español claro; sin textos técnicos al usuario. | `utils/errores.ts` | ✅ |
| RDV-13 | Sin `Alert.alert`: `useToast` y `useDialogo`. | `FeedbackProvider` | ✅ |
| RDV-14 | Realtime que invalida caché en `insumos`, `lista_compras` y `movimientos_inventario`. | `useRealtimeInvalidacion` | ✅ |
| RDV-15 | Fotos: redimensionado a 1024 px, JPEG 0.7, bucket `fotos-insumos`. | `subirFotoInsumo` | ✅ |
| RDV-16 | Geocodificación con el servicio del sistema y mapa con `react-native-maps`. | `geocodificacion.ts`, `SelectorUbicacion`, `SupplierMap` | ✅ |
| RDV-17 | Push: registro tolerante a fallos y navegación por *deep link*. | `notifications.ts`, `usePushNotifications` | ✅ |
| RDV-18 | Gráficos con `react-native-gifted-charts`. | `DashboardScreen` | 🔄 (H-01) |
| RDV-19 | Banner de «Sin conexión» no intrusivo. | `(app)/_layout.tsx`, `useEstaOnline` | ✅ |
| RDV-20 | Preferencias de incrementos persistidas por dispositivo. | `useUiStore` (`poscafe-ui`) | ✅ |
| RDV-21 | Lint con `eslint-config-expo`; pruebas con `jest-expo`. | `eslint.config.js`, `jest.config.js` | ✅ |
| RDV-22 | Compilación y distribución con EAS. | `eas.json` | 🔄 (perfiles no analizados en detalle; `projectId` es marcador) |

## Brechas de implementación

| ID | Brecha | Referencia |
|---|---|---|
| RDV-B1 | Recuperación de contraseña (RF-03) no implementada. | H-11 |
| RDV-B2 | Historial completo por insumo (RF-08): solo últimos 5 en detalle y 50 en actividad global. | H-10 |
| RDV-B3 | Etiquetas del gráfico semanal incorrectas. | H-01 |
| RDV-B4 | `@react-navigation/native-stack` residual. | H-17 |
| RDV-B5 | Nombre histórico `scan-modal` para una pantalla de fotos. | [Navegación](../02-diseno/diseno/06-navegacion-con-expo-router-y-guardas-por-rol.md) |
