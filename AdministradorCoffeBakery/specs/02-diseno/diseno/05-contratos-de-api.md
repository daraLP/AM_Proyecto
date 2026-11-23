# Fase 2 · Diseño: Contratos de API

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: [`../../README.md`](../../README.md)
> Contratos entre la app y Supabase tal como los implementan `src/services/*`. No existe API propia: la «API» es PostgREST (tablas), RPC, Storage, Auth y una Edge Function.

## 1. Estilos de retorno de los servicios

| Estilo | Servicios | Contrato |
|---|---|---|
| `{ data, error: string \| null }` | `insumos` (lectura simple y mutaciones), `movimientos.registrarMovimiento`, `categorias` (mutaciones), `auth` | No lanza; el mensaje ya viene traducido (`traducirError` → `mensajeDeError`) |
| Lanza `ErrorUsuario` | `listarInsumosPaginado`, `listarMovimientos`, `listarActividad`, `compras`, `proveedores`, `perfiles`, `dashboard`, `fotos`, `geocodificacion` | Hooks de TanStack Query reciben el error en `error`; `aErrorUsuario(error, <mensaje por defecto>?)` lo construye |

`ErrorUsuario` lleva un `mensaje` apto para pantalla y un `codigo` opcional (`"duplicado"`, `"stock_insuficiente"`…). `traducirError` en `movimientos.ts` se conserva por compatibilidad y delega en `utils/errores`.

## 2. Autenticación (`services/auth.ts`)

| Función | Llamada Supabase | Retorno |
|---|---|---|
| `iniciarSesion(correo, contrasena)` | `auth.signInWithPassword` | `{ error }` |
| `registrarse(correo, contrasena, nombre)` | `auth.signUp({ options: { data: { nombre } } })` | `{ error, confirmarCorreo }` (`true` si no hubo sesión inmediata) |
| `cerrarSesion()` | `auth.signOut()` | `{ error }` |

El rol **no** viaja en el registro (lo asigna `manejar_nuevo_usuario`).

## 3. Insumos (`services/insumos.ts`)

| Función | Operación | Notas |
|---|---|---|
| `listarInsumos()` | `from("insumos").select("*").eq("activo", true).order("nombre")` | `{data,error}` |
| `listarInsumosPaginado(pagina, filtros)` | Igual + `.range(p·20, p·20+19)`; filtros `categoria_id`, `estado_stock` (`bajo`/`agotado`), `ilike nombre %q%` | `TAMANO_PAGINA = 20`; `escaparLike` neutraliza `\`, `%`, `_` |
| `obtenerInsumo(id)` | `.eq("id", id).maybeSingle()` | `{data,error}` |
| `crearInsumo(datos, stockInicial)` | `insert(datos).select("id").single()`; si `stockInicial > 0`, `registrarMovimiento({ motivo: "Ajuste de inventario", nota: "Stock inicial" })` | **No envía `stock_actual`**; si el movimiento falla devuelve `id` y un mensaje parcial |
| `actualizarInsumo(id, datos)` | `update(datos).eq("id", id)` | Nunca incluir `stock_actual` (trigger) |
| `desactivarInsumo(id)` | `update({ activo: false })` | Solo administrador (RLS) |

`DatosInsumo`: `nombre`, `unidad_medida` (`UnidadMedida`), `stock_minimo`, `categoria_id?`, `proveedor_principal_id?`, `foto_url?`.

## 4. Movimientos (`services/movimientos.ts`)

### 4.1 `registrar_movimiento` (RPC)

| Parámetro SQL | Origen | Tipo |
|---|---|---|
| `p_insumo_id` | `insumoId` | `uuid` |
| `p_delta` | `delta` (con signo; ya acotado por `acotarDelta`) | `numeric` |
| `p_motivo` | `motivo` ∈ `MOTIVOS` | `text` |
| `p_nota` | `nota?.trim() \|\| undefined` | `text` (≤ 200) |
| `p_client_op_id` | `opId` (`generarUuid()` creado al montar el modal) | `uuid` |

Retorno de la función TS: `{ data: MovimientoInventario | null, error: string | null, codigo?: string }`. Reintento único tras 400 ms si la BD responde `23505` y hay `opId`.

### 4.2 Lecturas

| Función | Consulta |
|---|---|
| `listarMovimientos(insumoId, limite = 5)` | `movimientos_inventario` con `perfiles(nombre)`, orden `creado_en desc` |
| `listarActividad(limite = 50)` | `movimientos_inventario` con `perfiles(nombre)` e `insumos(nombre, unidad_medida)` |

## 5. Lista de compras (`services/compras.ts`)

| Función | Operación | Contrato |
|---|---|---|
| `listarCompras()` | `lista_compras` con `SELECT_ITEM`, `estado = 'pendiente'`, orden `creado_en asc` | Solo **pendientes** |
| `obtenerItemCompra(id)` | Idem por `id`, `maybeSingle` | Puede devolver un ítem ya comprado |
| `agregarCompraManual({ insumoId, cantidad, proveedorId? })` | `insert` con `origen='manual'`, `estado='pendiente'`, `creado_por = sesión` | `23505` → `ErrorUsuario(…, "duplicado")` (RN-06); sin sesión → `MENSAJES.sesionTerminada` |
| `comprarItem({ itemId, cantidad, opId })` | RPC `comprar_item(p_item_id, p_cantidad, p_client_op_id)` | Devuelve `ListaCompra`; idempotente |

## 6. Proveedores (`services/proveedores.ts`)

| Función | Operación |
|---|---|
| `listarProveedores()`, `obtenerProveedor(id)` | Lectura de `proveedores` |
| `proveedoresCercanos({ lat, lng, radioKm, insumoId? })` | RPC `proveedores_cercanos` (`p_lat`, `p_lng`, `p_radio_km`, `p_insumo_id`); radio enviado 25 km (H-09) |
| `crearProveedor(datos)` → `string` (id) / `actualizarProveedor(id, datos)` / `eliminarProveedor(id)` | CRUD; solo administrador |
| `listarInsumosDeProveedor(proveedorId)` | Insumos asociados vía `proveedor_insumos` |
| `asociarInsumo` / `desasociarInsumo` | `insert` / `delete` en `proveedor_insumos` |

## 7. Dashboard (`services/dashboard.ts`)

| Función | RPC | Validación en cliente |
|---|---|---|
| `obtenerResumenDashboard()` | `resumen_dashboard` | Acepta arreglo u objeto; `numeroValido` en `total`, `bajo`, `agotado` |
| `obtenerConsumoSemanal(dias = 7)` | `consumo_semanal(p_dias)` | `dias` entero ≥ 1 (si no, `Error`); `dia` string; `salidas` numérica |
| `obtenerConsumoPorInsumo(desde, hasta)` | `consumo_por_insumo(p_desde, p_hasta)` (ISO) | Solo administrador; `consumido`/`merma` numéricos |

Una respuesta con forma inesperada registra `console.warn("[dashboard] …")` y lanza un `ErrorUsuario` genérico.

## 8. Perfiles y categorías

| Función | Operación |
|---|---|
| `obtenerPerfil(userId)`, `listarPerfiles()` | Lectura de `perfiles` |
| `cambiarRol(userId, rol)` | `update({ rol })` (RLS admin + trigger) |
| `actualizarNombre(userId, nombre)` | `update({ nombre })` |
| `listarCategorias()` | Lectura ordenada por `nombre` |
| `crearCategoria(nombre)`, `renombrarCategoria(id, nombre)`, `eliminarCategoria(id)` | CRUD admin; `nombre.trim()` |

## 9. Fotos y geocodificación

| Función | Contrato |
|---|---|
| `subirFotoInsumo(uriLocal, insumoId)` | Redimensiona a ancho 1024, JPEG calidad 0.7; sube a `fotos-insumos/<insumoId>/<Date.now()>.jpg` con `upsert:false`; devuelve URL pública |
| `buscarDireccion(texto)` | `Location.geocodeAsync`; mínimo 4 caracteres; devuelve `{lat,lng}` |
| `direccionDeCoordenada(c)` | `reverseGeocodeAsync`; **nunca lanza** (`null` si falla); `formatearDireccion` elimina partes repetidas |

## 10. Push (`services/pushTokens.ts` y `lib/notifications.ts`)

| Función | Contrato |
|---|---|
| `guardarPushToken({ usuarioId, token, plataforma })` | `upsert` en `push_tokens` con `onConflict: token` |
| `eliminarPushToken(token)` | `delete` por token |
| `registrarPush(usuarioId)` | Nunca lanza (el push es opcional); requiere `Device.isDevice`; canal Android `stock-alerts`; ignora `projectId` que empiece por `REEMPLAZA` |
| `desregistrarPush()` | Se llama antes de `signOut` |

## 11. Edge Function `notify-low-stock`

| Aspecto | Contrato |
|---|---|
| Disparo | Database Webhook sobre `INSERT` en `lista_compras` (configuración no versionada ❔) |
| Autenticación | Cabecera `x-webhook-secret` contra `WEBHOOK_SECRET` |
| Credenciales | `service_role` desde `Deno.env` |
| Efecto | Lee insumo y `push_tokens`; envía a la Expo Push API (canal `stock-alerts`, `data: { route: "/compras", itemId }`); borra tokens `DeviceNotRegistered` |
| Consumo en la app | `usePushNotifications`: `data.route` si empieza por `/`, si no `/compras` |

## 12. Catálogo de errores (`MENSAJES`, `clasificar`)

| Origen | Código | Resultado para el usuario |
|---|---|---|
| Red | sin respuesta / `Failed to fetch` | Mensaje de conexión |
| Sesión | JWT expirado / 401 | `sesionTerminada` |
| Permisos | `42501` | «No tienes permiso…» o mensaje del trigger |
| Duplicado | `23505` | Según contexto (`duplicado`, ítem ya en lista, nombre repetido) |
| Stock | `23514` + `stock_insuficiente` | `codigo: "stock_insuficiente"` |
| Dominio | `22023` | Cantidad cero / motivo inválido |
| No encontrado | `P0002` | Insumo o ítem no disponible |
| Rango | `22003` | Cantidad fuera de límite (999 999) |
| Check | `23514` (otros) | Valor no permitido por una restricción |
| Otros | — | Mensaje genérico (`aErrorUsuario(error, porDefecto)`) |

> Los textos literales viven en `src/utils/errores.ts` (`MENSAJES`, 25 claves); este cuadro describe el mapeo, no sustituye al archivo.

## 13. Realtime (`hooks/useRealtime.ts`)

Canal con `postgres_changes` sobre `insumos`, `lista_compras` y `movimientos_inventario`; cada evento invalida las claves descritas en la [arquitectura frontend](04-arquitectura-frontend.md#43-claves-de-caché-y-su-invalidación). Solo activo con sesión.
