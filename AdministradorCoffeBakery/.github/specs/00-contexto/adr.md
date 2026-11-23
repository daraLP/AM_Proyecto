# Decisiones de arquitectura (ADR)

> **POSCafé · Specs · Contexto** · Índice general: [`../README.md`](../README.md)

## 1. Registro consolidado

| ID | Decisión | Estado histórico | Estado real (código) | Evidencia |
|---|---|---|---|---|
| **ADR-01** | **Expo Router** como navegación; rutas en `src/app`. | ✅ Resuelta | ✅ **Aplicada** | `app.json` (`plugin expo-router`, `scheme: poscafe`, `typedRoutes: true`); `package.json` (`"main": "expo-router/entry"`); árbol `src/app/(auth)`, `(app)/(tabs)`. Ya no existen `App.tsx`, `index.ts` clásico ni `src/navigation/*` |
| **ADR-02** | **TanStack Query con persistencia offline** (AsyncStorage) para estado de servidor; **Zustand** para estado de cliente. | ✅ Resuelta | ✅ **Aplicada** | `src/lib/queryClient.ts`, `src/providers/AppProviders.tsx` (`PersistQueryClientProvider`); stores `useAuthStore` y `useUiStore` |
| **ADR-03** | Cliente Supabase único. | ✅ Resuelta | ✅ **Aplicada** | `src/lib/supabaseClient.ts` es el único `createClient`; tipado con `Database` |
| **ADR-04** | Motivos como texto en español con `CHECK`; constante única `MOTIVOS`. | ✅ Resuelta | ✅ **Aplicada** | `src/types/database.ts` (`MOTIVOS`); `CHECK movimientos_inventario_motivo_check`; validación duplicada en `private.aplicar_movimiento` |
| **ADR-05** | Tipos generados en `src/types/database.types.ts` (UTF-8); tipos de dominio en `src/types/database.ts`. | ⬜ Por aplicar | ✅ **Aplicada** | Ambos archivos existen bajo `src/types/`; `database.ts` deriva de `Database["public"]["Tables"]`. Ya no hay carpeta `types/` en la raíz. *(La codificación UTF-8 se infiere porque el archivo se leyó sin corrupción; no se pudo verificar el BOM.)* |
| **ADR-06** | Los parámetros de Expo Router son *strings*: se pasa el `id`, no objetos. | ⬜ Por aplicar | ✅ **Aplicada** | `useLocalSearchParams<{ insumoId: string }>()` + `useInsumo(id)`; `router.push({ pathname: "/inventario/[insumoId]", params: { insumoId } })`; `/movimiento-modal` recibe `insumoId` y `delta` como string |
| **ADR-07** | Autorización en **tres capas**: layouts con redirección (UX), RLS y RPC `SECURITY DEFINER` (seguridad real). | ✅ Resuelta | ✅ **Aplicada** | `(app)/_layout.tsx`, `SoloAdmin`; 18 políticas RLS en `public` + 4 en `storage.objects`; `es_admin()`, `registrar_movimiento`, `comprar_item`, `consumo_por_insumo` |
| **ADR-08** | Los baristas **crean y editan insumos** (RN-10 modificada); el stock y la desactivación siguen restringidos. | ✅ Resuelta | ✅ **Aplicada** | Migración `20261015000000_baristas_editan_insumos.sql` (políticas `baristas_crean_insumos`, `baristas_editan_insumos`, y políticas de Storage para subir/reemplazar fotos). UI: el botón «Agregar insumo» y «Editar insumo» no están protegidos por rol; solo «Desactivar insumo» exige `useEsAdmin()` |

### Detalle de ADR-08 (evolución de la regla RN-10)

| Aspecto | Idea original | Código actual |
|---|---|---|
| Crear insumo | Solo administrador | Administrador **y barista**; el barista solo con `stock_actual = 0` y `activo = true` (`WITH CHECK` de `baristas_crean_insumos`) |
| Stock inicial | Campo del formulario | `crearInsumo()` inserta **sin** `stock_actual` y, si `stockInicial > 0`, llama a `registrarMovimiento` con motivo `Ajuste de inventario` y nota `Stock inicial` (queda en el historial) |
| Editar insumo | Solo administrador | Administrador y barista (`baristas_editan_insumos`: `USING activo = true`, `WITH CHECK activo = true`) |
| Editar `stock_actual` | — | **Nadie** por `UPDATE` (trigger `insumos_proteger_stock`, errcode `42501`); el formulario deshabilita el campo en edición (`editable={!id}`) |
| Desactivar / borrar | Solo administrador | Desactivar: solo administrador (el `WITH CHECK activo = true` del barista lo impide); borrar: no hay flujo en la app (RN-11) |
| Foto | Solo administrador | Barista puede subir y reemplazar (`fotos_insumos_baristas_subir/actualizar`); borrar: solo `es_admin()` |

## 2. ADR derivadas del código (no estaban en el registro histórico)

Estas decisiones están **implementadas** y condicionan el diseño; se registran para que dejen de ser conocimiento implícito.

| ID | Decisión | Estado | Evidencia y consecuencias |
|---|---|---|---|
| **ADR-09** | **La base de datos es la autoridad** de las reglas de negocio; la app nunca calcula el stock definitivo. La interfaz solo *proyecta* (`stockProyectado`, actualización optimista) y revierte ante error. | ✅ Aplicada | `useRegistrarMovimiento` (`onMutate` + rollback en `onError`); `estadoEsperado()` solo pinta |
| **ADR-10** | **Solo `registrar_movimiento` se encola sin conexión.** El resto de mutaciones (`networkMode: "always"`) fallan de inmediato con el mensaje de red; las consultas usan `offlineFirst`. | ✅ Aplicada | `queryClient.ts`: `setMutationDefaults(MUTATION_REGISTRAR_MOVIMIENTO, { networkMode: "online", retry: 2 })`. Consecuencia: `comprar_item`, crear insumo, etc. **no** funcionan offline |
| **ADR-11** | **Idempotencia por `client_op_id`** generado en el cliente (`generarUuid`) al abrir el modal y reutilizado en reintentos. | ✅ Aplicada | `MovimientoModalScreen` (`useRef(generarUuid()).current`), `ConfirmarCompraScreen`; índice único parcial `mov_client_op_uidx` |
| **ADR-12** | **Sistema de feedback propio** (`FeedbackProvider`: `useToast`, `useDialogo`, `<Aviso>`); no se usa `Alert.alert`. | ✅ Aplicada | `src/providers/FeedbackProvider.tsx`; no hay usos de `Alert.` en el código |
| **ADR-13** | **Traducción centralizada de errores**: la UI nunca muestra texto crudo de Supabase/Postgres/red; todo pasa por `mensajeDeError()` / `aErrorUsuario()` (clase `ErrorUsuario`). | ✅ Aplicada | `src/utils/errores.ts` (`MENSAJES`, 25 claves); pruebas `__tests__/errores.test.ts` verifican tono y ausencia de jerga |
| **ADR-14** | **Anti-doble toque** con `crearBloqueo` (enfriamiento 600 ms + promesa pendiente) en botones y formularios. | ✅ Aplicada | `src/utils/envioUnico.ts`; usado en `Boton`, `LoginScreen`, `RegisterScreen`, `InsumoFormScreen` |
| **ADR-15** | **Límites de entrada en dos capas**: `LIMITES` en la app (`validacion.ts`) y `CHECK … NOT VALID` en la BD (migración `20261122000000`). La BD es la autoridad. | ✅ Aplicada | `src/utils/validacion.ts`, `src/utils/delta.ts` (`LIMITE_SUPERIOR_DELTA = 999_999`), `supabase/tests/database/limites_de_entrada.test.sql` |
| **ADR-16** | **Distancia con Haversine en SQL, sin PostGIS.** | ✅ Aplicada | `public.proveedores_cercanos` (`LANGUAGE sql STABLE`) |
| **ADR-17** | **Push por Database Webhook → Edge Function → Expo Push.** El trigger SQL no llama a la red; el webhook sobre `INSERT` de `lista_compras` invoca `notify-low-stock`. | ✅ Código aplicado · ⚠️ configuración del webhook **no versionada** | `supabase/functions/notify-low-stock/index.ts` (cabecera `x-webhook-secret`); la definición del webhook no aparece en el código aportado |
| **ADR-18** | **Realtime solo para invalidar caché**, no para mutar estado local: los eventos de `insumos`, `movimientos_inventario` y `lista_compras` disparan `invalidateQueries`. | ✅ Aplicada | `src/hooks/useRealtime.ts`; migraciones `…0010`/`…0020` (publicación `supabase_realtime`) |
| **ADR-19** | **Fotos en un bucket público** `fotos-insumos` (2 MiB, JPEG/PNG/WebP); la app comprime a 1024 px de ancho y calidad 0.7 antes de subir. | ✅ Aplicada | Migración 0002 (`public = true`), `services/fotos.ts` (`getPublicUrl`). **Evolución:** el ADR histórico hablaba de «lectura autenticada»; el bucket es público y las URL no requieren sesión |
| **ADR-20** | **Reglas de acceso a datos mixtas:** lecturas directas con PostgREST (`from().select()`), escrituras sensibles por RPC. Los servicios usan dos convenciones de retorno (ver `convenciones.md`). | ✅ Aplicada | `src/services/*.ts` |

## 3. Decisiones abiertas o pendientes (detectadas por el código)

| ID | Tema | Situación en el código | Referencia |
|---|---|---|---|
| **ADR-A1** | Insumo nacido en `agotado` (stock 0 con `stock_minimo > 0`) | El trigger `insumos_stock_bajo` es `AFTER UPDATE`; un `INSERT` no genera ítem pendiente. La tarea histórica A-07 sigue sin resolverse en el esquema | Hallazgo **H-02** |
| **ADR-A2** | Idempotencia concurrente de `registrar_movimiento` | La búsqueda por `client_op_id` ocurre **antes** de `FOR UPDATE`; la mejora «migración 0003» de los documentos históricos **no existe** en `supabase/migrations/`. El cliente lo compensa reintentando una vez ante `23505` | Hallazgo **H-04** |
| **ADR-A3** | Protección «un administrador no se degrada a sí mismo» | Solo existe en la UI (botón deshabilitado) | Hallazgo **H-07** |
| **ADR-A4** | Webhook, secretos y `config.toml` | No versionados / no incluidos en el volcado | Hallazgo **H-06** |

> Los identificadores `H-xx` se definen en [`estado-actual.md`](estado-actual.md#4-hallazgos-de-la-ingeniería-inversa).
