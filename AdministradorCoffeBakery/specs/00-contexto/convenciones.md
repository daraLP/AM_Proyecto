# Convenciones, identificadores y estados

> **POSCafé · Specs · Contexto** · Índice general: [`../README.md`](../README.md)

## 1. Identificadores

| Prefijo | Significado | Dónde se define |
|---|---|---|
| `RN-xx` | Regla de negocio | [`01-analisis/requerimientos.md`](../01-analisis/requerimientos.md) |
| `RF-xx` / `RNF-xx` | Requerimiento funcional / no funcional | ídem |
| `CU-xx` | Caso de uso | [`01-analisis/diseno/01-casos-de-uso-principales.md`](../01-analisis/diseno/01-casos-de-uso-principales.md) |
| `HU-xx` | Historia de usuario | [`01-analisis/diseno/02-historias-de-usuario.md`](../01-analisis/diseno/02-historias-de-usuario.md) |
| `CA-xx` | Criterio de aceptación | historias (CA-01…10 y nuevos) y [`04-pruebas/requerimientos.md`](../04-pruebas/requerimientos.md) (CA-11…17 y nuevos) |
| `RD-xx` / `RDV-xx` | Requerimiento de diseño / de desarrollo | `02-diseno/requerimientos.md`, `03-desarrollo/requerimientos.md` |
| `A-xx`, `D-xx`, `DEV-xx`, `QA-xx` | Tareas de Análisis, Diseño, Desarrollo y Pruebas | `tareas.md` de cada fase |
| `ADR-xx` | Decisión de arquitectura | [`adr.md`](adr.md) |
| `H-xx` | Hallazgo de la ingeniería inversa (discrepancia, deuda o riesgo) | [`estado-actual.md`](estado-actual.md#4-hallazgos-de-la-ingeniería-inversa) |

> **Continuidad de IDs:** se conservan los identificadores históricos cuando existe equivalencia con el código (p. ej. `RN-01…RN-13`, `CU-01…CU-06`, `CA-01…CA-17`, `DEV-01…DEV-32`). Los elementos que el código implementa y los documentos históricos no recogían usan numeración nueva a continuación (`RN-14+`, `CU-07+`, `RF-18+`, `DEV-33+`…) y se marcan con 🆕.

**Estados de tarea:** ✅ hecho y verificable en el código · 🔄 implementado parcialmente o sin verificación suficiente · ⬜ no encontrado en el código · ⛔ descartado.
**Prioridad (MoSCoW):** **M** debe · **S** debería · **C** podría.
**Estado de requerimiento:** `Implementado` · `Parcial` · `No implementado`.

## 2. Nomenclatura del código

| Elemento | Convención real | Ejemplos |
|---|---|---|
| Idioma | Dominio y UI en **español**; identificadores técnicos de librería en inglés | `useInsumos`, `registrarMovimiento`, `PantallaCarga`, `ErrorState` (mezcla deliberada) |
| Tablas y columnas | `snake_case` en español | `movimientos_inventario`, `saldo_resultante`, `client_op_id` (única excepción en inglés) |
| Funciones SQL públicas | `snake_case` verbo/sustantivo | `registrar_movimiento`, `comprar_item`, `proveedores_cercanos`, `es_admin` |
| Funciones SQL privadas | Esquema `private` | `private.aplicar_movimiento`, `private.proteger_stock`, `private.al_cambiar_stock` |
| Parámetros RPC | Prefijo `p_` | `p_insumo_id`, `p_delta`, `p_client_op_id` |
| Triggers | `<tabla>_<propósito>` | `insumos_proteger_stock`, `perfiles_proteger_rol`, `insumos_stock_bajo` |
| Políticas RLS | Verbo en español + sujeto | `lectura_insumos`, `admin_escribe_insumos`, `baristas_crean_insumos` |
| Constraints | `<tabla>_<campo>_chk` / `*_check` | `insumos_stock_chk`, `mov_nota_chk`, `lc_un_pendiente_por_insumo` |
| Migraciones | `AAAAMMDDHHMMSS_descripcion.sql` | `20261015000000_baristas_editan_insumos.sql` |
| Componentes | `PascalCase` (español o inglés) | `QuickCounter`, `ReasonChips`, `SupplierMap`, `InsumoCard`, `StockBadge` |
| Pantallas | `<Nombre>Screen` en `src/features/<dominio>/` | `InsumoDetalleScreen`, `ListaComprasScreen` |
| Rutas (`src/app`) | Archivos *delgados* que re-exportan la pantalla | `export { ListaComprasScreen as default } from "@/features/listaCompras/ListaComprasScreen"` |
| Hooks | `use` + sustantivo en español | `useInsumos`, `useCompras`, `useRegistrarMovimiento`, `useUbicacion` |
| Servicios | Verbos en español | `listarInsumosPaginado`, `obtenerPerfil`, `comprarItem`, `asociarInsumo` |
| Alias de importación | `@/*` → `./src/*` (`tsconfig.json`, `jest.*.config.js`); conviven imports relativos antiguos | `@/utils/validacion` vs `../../services/auth` |
| Claves de caché | Arreglo con el recurso primero | `["insumos", filtros]`, `["insumo", id]`, `["compras", "item", id]`, `["dashboard", "reporte", desde, hasta]` |

**Nota de nomenclatura histórica:** los hooks se nombran en español (`useInsumos` ≙ `useSupplies`, `useRegistrarMovimiento` ≙ `useRegisterMovement`).

## 3. Convenciones de servicios (estado real)

Los servicios en `src/services/` usan **dos estilos de retorno**; ambos coexisten y deben conocerse al consumirlos:

| Estilo | Forma | Servicios |
|---|---|---|
| **A · Resultado explícito** | `{ data, error: string \| null }` — el error ya viene traducido (`traducirError`) | `insumos.ts` (`listarInsumos`, `obtenerInsumo`, `crearInsumo`, `actualizarInsumo`, `desactivarInsumo`), `movimientos.ts` (`registrarMovimiento`), `categorias.ts` (mutaciones: `{ error }`), `auth.ts` |
| **B · Excepción** | Lanza `ErrorUsuario` (vía `aErrorUsuario`) | `compras.ts`, `proveedores.ts`, `perfiles.ts` (salvo `obtenerPerfil`), `dashboard.ts`, `fotos.ts`, `geocodificacion.ts`, lecturas de `movimientos.ts` y `categorias.ts` |

Los hooks de mutación adaptan el estilo A a TanStack Query con `resolver()` (`useCatalogos.ts`) o lanzando `ErrorUsuario`.

## 4. Convenciones de errores y mensajes

1. **Nada de texto crudo.** Todo error pasa por `mensajeDeError(error, porDefecto?)` o `aErrorUsuario(error)`.
2. **`ErrorUsuario`** (`message` ya redactado + `codigo?`) se muestra tal cual. El único código funcional es `"stock_insuficiente"` (usado por `MovimientoModalScreen` para recalcular el delta); también `"duplicado"` y `"en_uso"`.
3. **Tono** (verificado por `__tests__/errores.test.ts`): cada mensaje de `MENSAJES` ≤ 150 caracteres, termina en punto y no contiene jerga (`sqlstate`, `jwt`, `rls`, `rpc`, `postgres`, `supabase`, `constraint`…).
4. **Nunca `Alert.alert`.** Herramientas del `FeedbackProvider`:

| Situación | Herramienta | Ejemplo real |
|---|---|---|
| Confirmación breve | `useToast().exito(titulo, detalle?)` | `toast.exito("Stock actualizado", "Leche: 12 litros")` |
| Fallo que no bloquea | `useToast().error(titulo, mensajeDeError(e))` | `toast.error("No pudimos guardar el insumo", …)` |
| Dato a revisar | `useToast().aviso(...)` | `toast.aviso("Guardado sin conexión", "Se enviará solo cuando vuelva el internet.")` |
| Información neutra | `useToast().info(...)` | `toast.info("Incrementos restablecidos")` |
| Acción destructiva | `await useDialogo().confirmar({ peligro: true, … })` | desactivar insumo, eliminar proveedor/categoría |
| Mensaje que debe leerse | `useDialogo().informar({ tipo, titulo, mensaje, accion? })` | permiso de cámara → «Abrir Ajustes» (`useAvisoPermiso`) |
| Error dentro de formulario/modal | `<Aviso tipo="error" mensaje=… />` | `MovimientoModalScreen`, `ConfirmarCompraScreen` |
| Pantalla que no cargó | `<ErrorState message onRetry />` | listas y detalles |
| Sección sin datos | `<EmptyState title message />` | inventario vacío, «Todo en orden» en compras |

5. **Toasts y modales:** los toasts no se ven sobre un modal nativo abierto; el patrón es cerrar el modal (`router.back()`) y **después** llamar al toast.
6. **Duración de toasts** (`DURACION_MS`): éxito 2600 ms · info 3200 ms · aviso 4200 ms · error 5200 ms. Un toast nuevo reemplaza al anterior; solo hay un diálogo a la vez.

## 5. Convenciones de estado y datos

| Tema | Regla |
|---|---|
| Estado de servidor | TanStack Query; `staleTime` por defecto 60 s; `gcTime` 24 h; catálogos (`categorias`, `proveedores`) 5 min |
| Estado de cliente | Zustand: `useAuthStore` (sesión/perfil, no persistido por Zustand; la sesión persiste en AsyncStorage vía Supabase) y `useUiStore` (incrementos, persistido con clave `poscafe-ui`) |
| Invalidación | Tras mutar se invalidan **sin `await`** (`void queryClient.invalidateQueries(...)`) para que, sin conexión, la recarga en espera no deje botones girando |
| Stock | Nunca se envía `stock_actual` en `update`/`insert` (el trigger lo rechaza): solo `registrar_movimiento` y `comprar_item` |
| Enteros y decimales | Cantidades con hasta **3 decimales** (`redondear3`); máximo **999 999** |
| Fechas | `formatearFecha` y `tiempoRelativo` con locale `es-MX` |
| Zona horaria del reporte semanal | `consumo_semanal` usa `America/Mexico_City` por defecto (la app no envía `p_tz`) |

## 6. Configuración y herramientas

| Tema | Valor (de `package.json` y configs) |
|---|---|
| Runtime | Expo `^58.0.26`, React `19.3.0`, React Native `0.88.1`, TypeScript `~6.0.3` (`strict: true`) |
| Scripts | `start`, `android` (`expo run:android`), `ios` (`expo run:ios`), `lint` (`eslint .`), `typecheck` (`tsc --noEmit`), `test` (`jest --ci -c jest.app.config.js`), `test:db` (`supabase test db supabase/tests/database`) |
| ESLint | `eslint-config-expo/flat`; ignora `dist/*`, `supabase/*`, `.expo/*`, `node_modules/*`, `jest.setup.js`, `jest.config.js` |
| Variables | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (la app lanza error al arrancar si faltan). La `service_role` solo la usa la Edge Function |
| Marcadores a reemplazar | `app.json` contiene `REEMPLAZA_CON_TU_CLAVE_IOS`, `REEMPLAZA_CON_TU_CLAVE_ANDROID` y `REEMPLAZA_CON_TU_PROJECT_ID_DE_EAS`; sin `projectId` el push queda desactivado (`registrarPush` lo detecta) |
| Builds | `eas.json`: `development` (development client, APK interno), `preview` (APK interno), `production` (`autoIncrement`) |
| Mapas y push | Requieren *development build* (no Expo Go) |

## 7. Convenciones de documentación (este árbol `specs/`)

- Cada documento declara su fuente en el código con rutas relativas a la raíz del repo.
- Las discrepancias entre idea/ADR histórico y código se marcan con `⚠️ Evolución` y, si son defectos o riesgos, con un identificador `H-xx`.
- Lo que **no** pudo verificarse (archivos no incluidos en el volcado) se marca `❔ No verificable`.
- Los diagramas están en Mermaid y se pueden renderizar en GitHub/VSCode.
