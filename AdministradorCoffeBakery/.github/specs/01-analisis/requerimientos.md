# Fase 1 · Análisis: Requerimientos

> **POSCafé · Specs · Fase 1 · Análisis** · Índice general: [`../README.md`](../README.md)
> Reconstruidos desde el código (`src/`, `supabase/`). Columnas «Mecanismo» = dónde se aplica realmente la regla.

## 1. Reglas de negocio (RN)

| ID | Regla | Mecanismo en BD | Mecanismo en app | Estado |
|---|---|---|---|---|
| RN-01 | El stock nunca es negativo. | `CHECK insumos_stock_chk (stock_actual >= 0 and stock_minimo >= 0)`, `CHECK mov_saldo_chk (saldo_resultante >= 0)`; `aplicar_movimiento` lanza `stock_insuficiente` (`23514`) | `acotarDelta(delta, stock)` limita la salida a `-stock`; `MovimientoModalScreen` recalcula con el stock fresco si el servidor responde `stock_insuficiente` | ✅ |
| RN-02 | Todo cambio de stock genera exactamente un movimiento con `saldo_resultante`. | `private.aplicar_movimiento` (una transacción: `UPDATE insumos` + `INSERT movimientos_inventario`) | Solo se usa `registrar_movimiento` y `comprar_item` | ✅ (H-03: `INSERT` directo de admin) |
| RN-03 | El stock solo cambia por `registrar_movimiento` o `comprar_item`. | Trigger `insumos_proteger_stock` (`42501`) permitido solo con `auth.uid()` nulo o `app.aplicando_movimiento = 'on'`; no existe política `INSERT` en `movimientos_inventario` | `crearInsumo` no envía stock; `actualizarInsumo` documenta «nunca incluir `stock_actual`»; campo deshabilitado al editar | ✅ |
| RN-04 | Las operaciones son idempotentes por `client_op_id`. | Índice único parcial `mov_client_op_uidx` + búsqueda previa en `aplicar_movimiento`; `comprar_item` es idempotente por `estado = 'comprado'` | `opId = generarUuid()` al abrir el modal (`useRef`), reutilizado en reintentos y en la cola offline; ante `23505` con `opId`, un reintento tras 400 ms | ✅ (H-04) |
| RN-05 | Motivo ∈ {Compra recibida, Uso en preparación, Merma/Vencido, Ajuste de inventario, Otro}; `tipo` se deduce del signo del delta (`entrada`/`salida`) y `cantidad` se guarda positiva. | `CHECK movimientos_inventario_motivo_check`, `_tipo_check`, `_cantidad_check (cantidad > 0)`; validación en la RPC (`22023`) | Constante `MOTIVOS`; `ReasonChips`; motivo por defecto `Uso en preparación` si `delta < 0`, `Compra recibida` si no | ✅ |
| RN-06 | Un solo ítem pendiente por insumo en la lista de compras. | Índice único parcial `lc_un_pendiente_por_insumo (insumo_id) WHERE estado = 'pendiente'`; `ON CONFLICT … DO NOTHING` en el trigger | `agregarCompraManual` traduce `23505` a «Este insumo ya está en tu lista de compras» (código `duplicado`) | ✅ |
| RN-07 | `stock_actual <= stock_minimo` ⇒ ítem automático; `stock_actual <= 0` ⇒ «agotado»; `ok` en otro caso. La cantidad sugerida es `max(2·mínimo − stock, 1)`. | Columna generada `estado_stock`; trigger `insumos_stock_bajo` → `private.al_cambiar_stock` (solo si `activo`) | `StockBadge` por `estado_stock`; filtros `bajo`/`agotado` | ✅ (H-02) |
| RN-08 | Marcar «comprado» cierra el ítem y reintegra stock (idempotente). La cantidad por defecto es la sugerida; se puede ajustar. | `comprar_item`: `UPDATE lista_compras` (`estado`, `cantidad_comprada`, `comprado_por`, `comprado_en`) y luego `aplicar_movimiento(… 'Compra recibida', 'Compra desde lista de compras' …)` | `ConfirmarCompraScreen` (`useComprarItem`, `opId` propio) | ✅ |
| RN-09 | El rol no es autoasignable; el primer usuario registrado es administrador y los demás baristas. | `manejar_nuevo_usuario` (ignora `raw_user_meta_data->>'rol'`); trigger `perfiles_proteger_rol` (`42501`) | `signUp` envía solo `{ nombre }` | ✅ |
| RN-10 | **Administrador:** CRUD de insumos (incluye desactivar), proveedores y categorías, reportes y usuarios. **Barista:** *crear y editar insumos* (stock inicial 0; sin cambiar `stock_actual` ni desactivar), registrar movimientos, agregar ítems manuales y marcar comprado. ⚠️ **Evolución:** original = barista solo mueve stock (ADR-08). | RLS: `admin_escribe_*`, `baristas_crean_insumos`, `baristas_editan_insumos` (migración `20261015000000`), `insertar_lista_manual`; RPC `consumo_por_insumo` solo admin | `useEsAdmin()` oculta «Desactivar insumo», «+ Nuevo» proveedor, editar/eliminar proveedor, accesos de administración; `SoloAdmin` en `reports`, `usuarios`, `categorias` | ✅ |
| RN-11 | El historial es inmutable; los insumos se desactivan, no se borran. | FK `movimientos_inventario.insumo_id … ON DELETE RESTRICT`; sin políticas `UPDATE`/`DELETE` en movimientos; `insumos.activo` | `desactivarInsumo` (baja lógica) | ✅ |
| RN-12 | El push se envía solo al insertar un ítem `origen = 'auto'`. | Webhook sobre `INSERT` + `ON CONFLICT DO NOTHING` (no hay nuevo `INSERT` si ya había pendiente) | Edge Function: `if (record.origen !== "auto") return "omitido"` | 🔄 (webhook no verificable, H-06) |
| RN-13 | Proveedores sin coordenadas no se muestran en el mapa. | `proveedores_cercanos` filtra `latitud/longitud IS NOT NULL` | `useProveedoresCercanos` (rama sin posición también filtra nulos); la lista indica «Sin ubicación: no aparece en el mapa» | ✅ |
| RN-14 🆕 | **Límites de entrada.** Texto: nombre de insumo 2–80, proveedor 2–80, categoría 2–40, persona 1–60 (app exige ≥ 2), correo ≤ 254, contraseña 6–72, teléfono ≤ 20 (≥ 7 dígitos), dirección ≤ 200, nota ≤ 200. Números: cantidad ≤ **999 999**, **3 decimales**, sin negativos en campos de cantidad. Coordenadas: latitud ∈ [−90, 90], longitud ∈ [−180, 180]. | `CHECK … NOT VALID` de la migración `20261122000000` + trigger `mov_validar_delta` (`22003`) | `LIMITES`, `validarTexto`, `validarCantidad`, `validarTelefono`, `validarCorreo`, `filtrarEntradaNumerica`, `normalizarTexto`; esquemas `zod` en Login/Register/Insumo | ✅ |
| RN-15 🆕 | **Incrementos rápidos:** entre 1 y 4 valores únicos, > 0 y ≤ 999 999, redondeados a 3 decimales; por defecto `[1, 5, 10]`; persisten por dispositivo. | — | `useUiStore.normalizar()` (persistido con clave `poscafe-ui`); `PerfilScreen` | ✅ |
| RN-16 🆕 | **Fotos de insumos:** JPEG/PNG/WebP, ≤ 2 MiB; la app redimensiona a 1024 px de ancho y comprime a JPEG 0.7. | Bucket `fotos-insumos` (`file_size_limit = 2097152`, `allowed_mime_types`) | `subirFotoInsumo`; mensajes `fotoPesada`/`fotoFormato` | ✅ |
| RN-17 🆕 | **Eliminación con dependencias:** una categoría en uso o un proveedor con insumos/compras asociados no se puede eliminar. | FKs sin cascada (`23503`) | `eliminarCategoria` / `eliminarProveedor` traducen `23503` a mensajes concretos | ✅ |
| RN-18 🆕 | **Un administrador no se cambia el rol a sí mismo desde la app.** | ❌ No aplicada en BD (H-07) | Botón deshabilitado cuando `item.id === miId` | 🔄 solo UI |
| RN-19 🆕 | **Registro:** el nombre se normaliza (espacios colapsados) y se recorta a 60 en BD; si el proyecto exige confirmación de correo, la app informa y redirige a login. | `manejar_nuevo_usuario` (0005) | `registrarse()` devuelve `confirmarCorreo = !error && !data.session` | ✅ |
| RN-20 🆕 | **Offline:** solo `registrar_movimiento` se encola; sin conexión, el resto falla con «No hay conexión a internet…». Las consultas se sirven de caché (hasta 24 h). | — | `networkMode` por defecto (`offlineFirst` en queries, `always` en mutaciones; `online` en el movimiento) | ✅ |

## 2. Requerimientos funcionales (RF)

| ID | Requerimiento | Prio. | Estado | Componentes principales |
|---|---|---|---|---|
| RF-01 | Registro e inicio de sesión con correo y contraseña. | M | Implementado | `RegisterScreen`, `LoginScreen`, `services/auth.ts` |
| RF-02 | Sesión persistente entre aperturas de la app. | M | Implementado | `supabaseClient` (`persistSession`, AsyncStorage), `authStore.inicializar` |
| RF-03 | Recuperación de contraseña. | C | **No implementado** (H-11) | — |
| RF-04 | Dashboard: total de insumos, alertas (bajo/agotado) y gráfico de consumo semanal. | M | Implementado (H-01) | `DashboardScreen`, `useDashboard`, `resumen_dashboard`, `consumo_semanal` |
| RF-05 | Inventario paginado (scroll infinito, 20 por página) con filtros por categoría/estado y buscador con *debounce*. | M | Implementado | `InventarioListScreen`, `useInsumos`, `listarInsumosPaginado` |
| RF-06 | Detalle de insumo con foto, unidad, stock, estado e historial reciente. | M | Implementado | `InsumoDetalleScreen`, `useInsumo`, `useMovimientos` |
| RF-07 | Registrar movimiento con contador rápido, incrementos configurables y motivo con chips (nota opcional con «Otro»). | M | Implementado | `QuickCounter`, `ReasonChips`, `MovimientoModalScreen`, `registrar_movimiento` |
| RF-08 | Historial de movimientos por insumo (fecha, usuario, cantidad, motivo, saldo). | M | **Parcial** (H-10): detalle muestra los últimos 5 (fecha, usuario, nota, ±cantidad); no hay historial completo ni se muestra el saldo | `useMovimientos`, `listarMovimientos` |
| RF-09 | Crear y editar insumos con foto (administrador **y barista**); desactivar insumos (solo administrador). | M | Implementado | `InsumoFormScreen`, `FotoInsumoScreen`, `crearInsumo`, `actualizarInsumo`, `desactivarInsumo` |
| RF-10 | CRUD de proveedores y asociación con insumos (administrador). | M | Implementado | `ProveedorDetalleScreen`, `useGestionProveedores`, `asociarInsumo`/`desasociarInsumo` |
| RF-11 | Lista de compras automática y manual; confirmación de compra con reintegro de stock. | M | Implementado | `ListaComprasScreen`, `ShoppingItem`, `ConfirmarCompraScreen`, `comprar_item` |
| RF-12 | Mapa de proveedores cercanos con distancia desde la ubicación del usuario. | M | Implementado | `SupplierMap`, `useUbicacion`, `useProveedoresCercanos`, `proveedores_cercanos` |
| RF-13 | Notificación push al cruzar el umbral mínimo (con deep link a Compras). | M | Implementado en código · webhook ❔ | `lib/notifications.ts`, `usePushNotifications`, Edge Function `notify-low-stock` |
| RF-14 | Reportes de consumo por insumo (rangos 7 d / 30 d / este mes / 90 d) — solo administrador. | S | Implementado | `DashboardReportsScreen`, `consumo_por_insumo` |
| RF-15 | Perfil: datos, edición de nombre, incrementos rápidos, cerrar sesión. | M | Implementado | `PerfilScreen`, `useUiStore` |
| RF-16 | Gestión de usuarios y roles (administrador). | S | Implementado (H-07) | `UsuariosScreen`, `useGestionUsuarios` |
| RF-17 | CRUD de categorías (administrador). | S | Implementado | `CategoriasScreen`, `useGestionCategorias` |
| RF-18 🆕 | «Actividad del equipo»: últimos 50 movimientos de todos, con quién, qué y cuándo. | S | Implementado | `ActividadScreen`, `useActividad`, `describirMovimiento`, `tiempoRelativo` |
| RF-19 🆕 | Ubicar un proveedor por dirección (geocodificación), tocando el mapa, con «Usar mi ubicación» y pin arrastrable. | S | Implementado | `SelectorUbicacion`, `services/geocodificacion.ts` |
| RF-20 🆕 | Cambiar la foto de un insumo existente (cámara o galería) desde el detalle (`/scan-modal`). | S | Implementado | `FotoInsumoScreen`, `useAvisoPermiso` |
| RF-21 🆕 | Agregar un insumo a la lista de compras de forma manual (desde Compras o desde la ficha del proveedor). | M | Implementado | `ModalAgregarManual`, `ProveedorDetalleScreen`, `useAgregarCompraManual` |
| RF-22 🆕 | Indicador «Sin conexión» y reenvío automático de movimientos en cola al reconectar. | M | Implementado | `(app)/_layout.tsx`, `useEstaOnline`, `AppProviders.onSuccess → resumePausedMutations` |

## 3. Requerimientos no funcionales (RNF)

| ID | Requerimiento | Métrica / criterio objetivo | Estado real |
|---|---|---|---|
| RNF-01 | Rendimiento | Página de 20 ítems < 1 s en 4G; `registrar_movimiento` p95 < 500 ms | Diseño acorde (índices parciales, paginación 20, `React.memo` en filas); **sin mediciones** en el repo |
| RNF-02 | Offline | Lectura desde caché persistida; movimientos en cola con idempotencia; indicador «Sin conexión» | Implementado (ADR-10, RN-20) |
| RNF-03 | Seguridad | RLS en las 8 tablas; ninguna acción sensible depende solo de la UI; claves fuera del repositorio | RLS ✅; `service_role` solo en Edge Function; **H-07** (solo-UI) y marcadores `REEMPLAZA_…` en `app.json` |
| RNF-04 | Usabilidad | Registrar un movimiento en ≤ 3 toques; objetivos táctiles ≥ 44 pt | Cumplido: chip/± → «Confirmar» → «Registrar» (motivo preseleccionado); `Boton` `minHeight: 50`; `Encabezado` `minHeight: 44` |
| RNF-05 | Concurrencia | N movimientos simultáneos dan saldo exacto | `SELECT … FOR UPDATE`; script `concurrencia.pgbench.sql` (sin resultados registrados) |
| RNF-06 | Mantenibilidad | TypeScript estricto; tipos generados; capa de servicios única | `strict: true`; `Database` generado; Supabase solo en `services/`, `lib/` y `hooks/useRealtime.ts` |
| RNF-07 | Observabilidad | Errores traducidos al usuario y registrados en consola | `console.warn/error` en servicios; **sin** servicio remoto de errores |
| RNF-08 | Compatibilidad | Android e iOS; *development build* para mapas y push | `app.json` (Android `com.poscafe.app`, iOS `supportsTablet: false`); versiones mínimas ❔ no verificables |
| RNF-09 | Accesibilidad | `accessibilityLabel`/`Role` en controles; contraste AA | Roles y etiquetas presentes (`radiogroup`/`radio` en chips, `alert`, `checkbox`, `liveRegion` en proyección); contraste no medido |
| RNF-10 🆕 | Robustez de entrada | Rechazar vacíos, texto en campos numéricos, negativos, >3 decimales, desbordes y textos largos | `validacion.ts` + pruebas `tests/validacion.test.ts`; BD como autoridad (`CHECK`) |
| RNF-11 🆕 | Mensajería clara | Ningún texto técnico llega a la UI; ≤ 150 caracteres; termina en punto | `mensajeDeError` + `__tests__/errores.test.ts` |
| RNF-12 🆕 | Anti-doble envío | Dos toques seguidos ejecutan la acción una sola vez | `crearBloqueo` + `tests/envioUnico.test.ts` |
| RNF-13 🆕 | Resiliencia de sesión | Tolerar desfase de reloj en la carga del perfil y refrescar tokens según el estado de la app | `obtenerPerfil` (reintentos 400/1000/2000 ms ante `PGRST303`); `suscribirseACambiosAuth` (`startAutoRefresh`/`stopAutoRefresh` por `AppState`) |

## 4. Resumen de cobertura

| Categoría | Total | Implementado | Parcial | No implementado |
|---|---:|---:|---:|---:|
| RF | 22 | 20 | 1 (RF-08) | 1 (RF-03) |
| RN | 20 | 18 | 2 (RN-12, RN-18) | 0 |
| RNF | 13 | 9 | 4 (RNF-01, 05, 07, 08: sin medición/verificación) | 0 |
