# Fase 2 · Diseño: Requerimientos de diseño

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: [`../README.md`](../README.md)
> Decisiones de diseño (RD) y requisitos no funcionales de arquitectura que el código cumple. Cada fila apunta a su evidencia.

| ID | Requisito de diseño | Evidencia | Estado |
|---|---|---|---|
| RD-01 | **Un solo cliente de Supabase** y acceso a datos solo desde `src/services`. | `src/lib/supabaseClient.ts`; ninguna pantalla importa `supabase` | ✅ |
| RD-02 | **La BD es la autoridad del stock;** la UI solo proyecta (`stockProyectado`, actualización optimista con *rollback*). | `useRegistrarMovimiento`, `estadoEsperado` | ✅ |
| RD-03 | **Autorización en tres capas:** layouts (UX), RLS y RPC/triggers. | [Seguridad RLS](diseno/03-seguridad-rls-resumen.md) | ✅ |
| RD-04 | **El stock solo cambia vía `registrar_movimiento` / `comprar_item`** (bandera transaccional `app.aplicando_movimiento`). | Trigger `insumos_proteger_stock` | ✅ |
| RD-05 | **Idempotencia** por `client_op_id` (UUID generado al montar el modal y conservado en reintentos). | `MovimientoModalScreen`, `mov_client_op_uidx` | ✅ |
| RD-06 | **Estados de pantalla explícitos:** carga (`PantallaCarga`), error con *Reintentar* (`ErrorState`), vacío (`EmptyState`). | Componentes compartidos | ✅ |
| RD-07 | **Rutas delgadas:** los archivos de `src/app` solo re-exportan pantallas de `src/features`; las pantallas reciben únicamente identificadores (ADR-06). | `src/app/**` | ✅ |
| RD-08 | **Offline limitado a movimientos:** cola de `registrar_movimiento`; el resto falla rápido; las consultas sirven caché. | `queryClient.ts` | ✅ |
| RD-09 | **Errores centralizados:** `ErrorUsuario`, `MENSAJES`, `clasificar`; sin `Alert.alert`; toasts y diálogos propios. | `utils/errores.ts`, `FeedbackProvider` | ✅ |
| RD-10 | **Anti-doble toque** en cualquier acción que muta (`crearBloqueo` 600 ms + promesa pendiente). | `Boton`, `utils/envioUnico.ts` | ✅ |
| RD-11 | **Validación en dos capas:** cliente (`LIMITES`, `zod`) y BD (`CHECK … NOT VALID`, `mov_validar_delta`). | RN-14 | ✅ |
| RD-12 | **Sincronización en tiempo real** por invalidación de caché (no se aplican *payloads* de Realtime). | `useRealtimeInvalidacion` | ✅ |
| RD-13 | **Proximidad sin PostGIS:** Haversine en SQL y radio fijo; el cliente redondea la posición para la clave de caché. | `proveedores_cercanos`, `redondearPosicion` | ✅ |
| RD-14 | **Compatibilidad iOS/Android:** encabezado JS propio (`Encabezado`), insets explícitos, `userInterfaceStyle: "light"`. | `components/Encabezado.tsx` | ✅ |
| RD-15 | **Caché persistida versionada** (`buster`) y limpiada al cambiar de usuario o cerrar sesión. | `limpiarCachePersistida` | ✅ |
| RD-16 | **Notificaciones con degradación:** el registro de push nunca bloquea la app (sin dispositivo físico, sin permiso o sin `projectId` simplemente se omite). | `registrarPush` | ✅ |
| RD-17 | **Rol asignado por el servidor** (nunca por metadata del cliente). | `manejar_nuevo_usuario` | ✅ |
| RD-18 | **Accesibilidad básica:** `accessibilityRole`/`Label`/`State`, regiones vivas y anuncios en toasts. | `Boton`, `QuickCounter`, `ReasonChips`, `Toast` | 🔄 (sin auditoría formal) |
| RD-19 | **Rendimiento de listas:** paginación de 20, `FlatList`, `React.memo` en tarjetas, *debounce* de 300 ms en la búsqueda. | `InventarioListScreen`, `useDebounce` | ✅ |
| RD-20 | **Aislamiento de datos sensibles:** `service_role` solo en la Edge Function; secretos fuera del repositorio. | Edge Function | 🔄 (no verificable: H-06) |

## Requisitos de diseño no cumplidos o con brecha

| ID | Brecha | Referencia |
|---|---|---|
| RD-B1 | Un insumo insertado con stock bajo el mínimo no genera ítem automático (el trigger es `AFTER UPDATE`). | H-02 |
| RD-B2 | La etiqueta del gráfico semanal usa `dia.slice(0, 3)` sobre una fecha ISO (`YYYY-MM-DD`), por lo que muestra el año recortado. | H-01 |
| RD-B3 | Zona horaria de `consumo_semanal` fija en `America/Mexico_City`, aunque la operación puede estar en otra. | H-08 |
| RD-B4 | Radio de proximidad duplicado (10 km en SQL, 25 km en el servicio). | H-09 |
| RD-B5 | Dependencia residual `@react-navigation/native-stack` solo para tipos del encabezado. | H-17 |
