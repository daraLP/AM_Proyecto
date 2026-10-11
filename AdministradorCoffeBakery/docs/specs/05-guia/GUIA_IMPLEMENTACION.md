# Guía de implementación paso a paso (con agente de IA)

Esta guía te lleva de tu repositorio actual a la app terminada, en **hitos** pequeños. Cada hito tiene sus tareas, qué leer, un **prompt listo para pegar** y una lista de verificación.

## Antes de empezar (una sola vez)

1. **Copia el contenido del paquete a la raíz de tu repo** (respeta las rutas): `AGENTS.md`, `CLAUDE.md`, `docs/`, `supabase/` y `.github/`.
2. **Crea una rama y haz un commit de respaldo:** `git checkout -b especificaciones` → `git add -A && git commit -m "docs: specs y AGENTS.md"`.
3. **Abre el repo en VSCode** con el agente que uses (Claude Code, Cursor, Copilot en modo agente, etc.). La mayoría lee `AGENTS.md` automáticamente; `CLAUDE.md` lo importa para Claude Code. Si tu herramienta no lo lee, pega el contenido de `AGENTS.md` como instrucción inicial.
4. **Prepara la base local** (recomendado para que el agente nunca toque producción): instala Docker y la CLI de Supabase, y ejecuta `supabase start`.
5. **Marca la migración como ya aplicada** (la 0002 ya se ejecutó a mano en tu proyecto remoto): `supabase migration repair --status applied 20261010000000`. Así `supabase db push` no la repite.

## Cómo trabajar con el agente (ciclo de cada tarea)

1. Pega el prompt del hito (o escribe «Implementa la tarea DEV-05»).
2. El agente lee `AGENTS.md`, la fila de la tarea y los archivos del mapa de contexto.
3. **Revisa el diff** antes de aceptar (especialmente SQL, RLS y todo lo que toque stock o roles).
4. Ejecuta tú mismo las verificaciones: `npx tsc --noEmit`, `npm run lint`, `npx jest --ci` y `supabase test db`.
5. Prueba a mano en el dispositivo o emulador con un usuario administrador y uno barista.
6. Haz **un commit por tarea** (`feat(DEV-05): QuickCounter`). Si algo sale mal, vuelves atrás con un solo `git revert`.

**Reglas de oro:** una tarea por conversación; si el agente propone romper una regla de `AGENTS.md`, rechaza el cambio; nunca le des la `service_role` ni el contenido de `.env`.

---

## Hito 0: Higiene del repositorio y tipos

**Tareas:** D-04, D-16, D-17, D-18, D-19, DEV-28 · **Lee:** `00-contexto/estado-actual.md`, `02-diseno/diseno/01-modelo-de-datos-…`

**Prompt:**
> Lee `AGENTS.md` y `docs/specs/00-contexto/`. Ejecuta D-16, D-18 y DEV-28: mueve los tipos generados de `/types/supabase.ts` a `src/types/database.types.ts` en UTF-8 (están en UTF-16), borra el duplicado, haz que `src/lib/supabaseClient.ts` use `createClient<Database>` y deriva los tipos de dominio de `src/types/database.ts` de los generados. Verifica que `.gitignore` incluya `.env`, `.expo/` y `supabase/.temp/`. No toques la lógica de las pantallas.

**Verifica:** `npx tsc --noEmit` sin errores · `git status` sin `.env` · un solo cliente Supabase.

## Hito 1: Expo Router

**Tareas:** D-12, D-13, D-14, D-15 (+ parte de DEV-30: `PantallaCarga`, `SoloAdmin`, `ErrorPerfil`) · **Lee:** `02-diseno/diseno/06-navegacion-…`, `04-arquitectura-frontend.md`

**Prompt:**
> Implementa D-12 a D-15 siguiendo `docs/specs/02-diseno/diseno/06-navegacion-con-expo-router-y-guardas-por-rol.md`. Configura Expo Router (`main: expo-router/entry`, `scheme`, plugin, `typedRoutes`, alias `@/*`), crea el árbol `src/app` con rutas delgadas que re-exportan las pantallas de `src/features`, implementa las guardas `(auth)`, `(app)` y `SoloAdmin`, y migra las pantallas existentes a `useRouter`/`useLocalSearchParams` (pasa `id`, no objetos). Elimina `App.tsx`, el `index.ts` clásico y `src/navigation/*` cuando todo funcione.

**Verifica:** sin sesión → `/login` · con sesión → `/dashboard` · barista en `/dashboard/reports` → redirige · las 4 tabs navegan.

## Hito 2: Sesión, providers y capa de datos

**Tareas:** DEV-01, DEV-02, DEV-03, DEV-04, DEV-29, DEV-30 · **Lee:** `01-analisis/requerimientos.md` (RN-09), `02-diseno/diseno/04-…`, `05-contratos-de-api.md`

**Prompt:**
> Implementa DEV-01 a DEV-04, DEV-29 y DEV-30. Valida `authStore` (sin `rol` en `signUp`, sin `await` en `onAuthStateChange`), crea `lib/queryClient.ts` con persistencia en AsyncStorage y `onlineManager` con NetInfo, el provider `AppProviders` en `src/app/_layout.tsx` y los componentes `EmptyState`/`ErrorState`. Asegura que todo acceso a Supabase esté en `src/services`.

**Verifica:** cerrar y reabrir la app mantiene la sesión · registrar un usuario nuevo crea un barista · el primer usuario es administrador.

## Hito 3: Contador rápido (el diferenciador)

**Tareas:** DEV-05, DEV-06, DEV-07, DEV-08 · **Lee:** `03-desarrollo/diseno/01-quickcounter-…`, CU-01, `02-diseno/diseno/02-funciones-…`, `05-contratos-de-api.md`

**Prompt:**
> Implementa DEV-05 a DEV-08: `QuickCounter` y `ReasonChips` (con la constante `MOTIVOS`), el hook `useRegistrarMovimiento` con actualización optimista, rollback y `opId`, la pantalla `InsumoDetalle` en `/inventario/[insumoId]` y `movimiento-modal`. Cumple los criterios CA-01 y CA-02. Escribe las pruebas de `QuickCounter` y del hook (QA-02, QA-03).

**Verifica:** stock 10 − 6 con «Uso en preparación» → 4 y el historial muestra saldo 4 · restar de más muestra el mensaje y no cambia nada · modo avión + reconexión no duplica.

## Hito 4: Inventario y CRUD (administrador)

**Tareas:** DEV-11, DEV-12, DEV-13, DEV-14 · **Lee:** `03-desarrollo/diseno/02-…`, `02-diseno/diseno/03-seguridad-rls-resumen.md`

**Prompt:**
> Implementa DEV-11 a DEV-14: inventario paginado de 20 en 20 con filtros por categoría y estado y búsqueda con debounce (TanStack Query, `useInfiniteQuery`), formulario de insumo que **no envía `stock_actual`** (el stock inicial se registra con `registrar_movimiento`), CRUD de proveedores y categorías, y subida de foto al bucket `fotos-insumos`. Los botones de edición solo para administradores.

**Verifica:** un barista no ve «Agregar/Editar» y, aunque llamara a la API, la base lo rechaza · crear insumo con stock inicial deja un movimiento en el historial.

## Hito 5: Lista de compras

**Tareas:** DEV-31 (`compras.ts`), DEV-15, DEV-16 · **Lee:** `03-desarrollo/diseno/03-…`, CU-03

**Prompt:**
> Implementa DEV-15, DEV-16 y `services/compras.ts`: lista de pendientes con checkbox, `confirmar-compra-modal` con cantidad editable que llama a `comprar_item` con `opId`, y alta manual (manejando el conflicto del índice único de pendientes).

**Verifica:** CA-05 y CA-06 (comprar dos veces no suma dos veces) · compra parcial genera un nuevo pendiente.

## Hito 6: Mapa de proveedores

**Tareas:** DEV-17, DEV-18 · **Lee:** `03-desarrollo/diseno/03-…`, CU-04

**Prompt:**
> Implementa DEV-17 y DEV-18 con `react-native-maps` y `expo-location` (permiso «en uso»): hook `useProveedoresCercanos` sobre la RPC `proveedores_cercanos`, `SupplierMap` con marcadores y distancia, y `ProveedorDetalle`. Si se deniega el permiso, la pantalla sigue funcionando sin distancia.

**Verifica:** requiere *development build* (no Expo Go): `npx expo run:android`.

## Hito 7: Dashboard, reportes, perfil y usuarios

**Tareas:** DEV-09, DEV-10, DEV-22, DEV-23, DEV-24 y DEV-32 (se implementan juntas), DEV-25 · **Lee:** `03-desarrollo/diseno/05-dashboard.md`

**Prompt:**
> Valida y completa DEV-09, DEV-10, DEV-22, DEV-23, DEV-24/32 y DEV-25 contra las RPC `resumen_dashboard`, `consumo_semanal` y `consumo_por_insumo`. Reportes y gestión de usuarios envueltos en `SoloAdmin`. Perfil con incrementos rápidos persistentes (Zustand + AsyncStorage). Suscripción Realtime a `insumos` y `lista_compras` que invalide las consultas.

## Hito 8: Notificaciones push

**Tareas:** DEV-19, DEV-20, DEV-21 · **Lee:** `03-desarrollo/diseno/04-notificaciones-push.md`, CU-02

**Prompt:**
> Implementa DEV-19 a DEV-21: registro del token en `push_tokens` (con canal Android `stock-alerts`), Edge Function `supabase/functions/notify-low-stock/index.ts` (valida `x-webhook-secret`, filtra `origen = 'auto'`) y deep link a `/compras`. Dame los comandos de despliegue y los pasos para crear el Database Webhook; **no ejecutes nada contra producción**.

**Verifica (tú, a mano):** `npx supabase secrets set WEBHOOK_SECRET=…` → `npx supabase functions deploy notify-low-stock` → crear el webhook en Dashboard → Database → Webhooks (`lista_compras`, `INSERT`, header `x-webhook-secret`) → bajar un insumo bajo el mínimo en un dispositivo real.

## Hito 9: Pruebas y CI

**Tareas:** QA-01…QA-10, QA-14, QA-17, QA-18 · **Lee:** `04-pruebas/`

**Prompt:**
> Completa las pruebas pendientes según `docs/specs/04-pruebas/`: unitarias, componentes, guardas de Expo Router, la suite pgTAP `supabase/tests/database/rls_y_stock.test.sql` y el pipeline `.github/workflows/ci.yml`. Corre `supabase db reset && supabase test db` y reporta los resultados.

**Verifica:** CI verde en `main` · prueba de concurrencia: 20 clientes × 50 salidas de 1 unidad dejan stock 0, 1000 movimientos y saldos únicos (`pgbench`, ver `04-pruebas/diseno/05-…`).

## Hito 10: Build y entrega

**Tareas:** DEV-26, DEV-27, QA-11…QA-13, QA-15, QA-16 · **Lee:** `03-desarrollo/requerimientos.md`

**Prompt:**
> Configura `app.config`/`app.json`, permisos de ubicación y notificaciones, `eas.json` con los perfiles `development`, `preview` y `production`, y dame la lista de secretos que debo cargar en EAS. Prepara la lista de verificación previa a la entrega.

**Verifica:** `eas build --profile preview --platform android` genera un APK que instala y ejecuta todos los flujos.

---

## Si el agente se desvía

| Síntoma | Qué hacer |
|---|---|
| Propone `update insumos set stock_actual` | Rechazar; recordarle la regla 1 de `AGENTS.md` |
| Envía `rol` en `signUp` | Rechazar (regla 3) |
| Escribe SQL directamente en el remoto | Pedir una migración en `supabase/migrations/` y probarla en local |
| Cambia muchas cosas a la vez | Revertir y pedir solo la tarea indicada |
| Los tipos de Supabase vuelven a salir en UTF-16 | Usar el comando `cmd /c` de `AGENTS.md` |
