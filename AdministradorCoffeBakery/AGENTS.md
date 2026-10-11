# AGENTS.md: POSCafé

## Qué es este proyecto
App móvil de gestión de inventario para cafeterías. **React Native + Expo (Expo Router)** en el cliente y **Supabase** (PostgreSQL, Auth, RLS, Realtime, Storage, Edge Functions) como backend.
Diseño completo: `docs/SDD_POSCafé.md`. Especificaciones por fase: `docs/specs/` (empieza por `docs/specs/README.md`).

## Flujo obligatorio por tarea
1. Recibirás un ID de tarea (p. ej. `DEV-05`). Búscalo en `docs/specs/<fase>/tareas.md`.
2. Lee **solo** los archivos del «Mapa de contexto por tarea» de `docs/specs/README.md`. No cargues todo.
3. Si algo es ambiguo o contradice estas reglas, **pregunta antes de escribir código**.
4. Implementa en cambios pequeños y enfocados en esa tarea. No refactorices cosas ajenas.
5. Verifica (ver «Comandos»). Si algo falla, corrígelo antes de dar la tarea por terminada.
6. Actualiza el estado de la tarea en su `tareas.md` (⬜ → 🔄 → ✅) y resume: qué cambiaste, qué archivos, qué falta.
7. **No hagas commit ni push** salvo que te lo pida explícitamente.

## Reglas innegociables (seguridad e integridad de datos)
1. **Nunca** modifiques `insumos.stock_actual` con `update`/`insert`. El stock solo cambia con las RPC `registrar_movimiento` y `comprar_item`.
2. **Nunca** insertes en `movimientos_inventario` desde el cliente (no hay política de INSERT; es inmutable).
3. `signUp` **solo** envía `nombre`. **Nunca** envíes `rol`: lo asigna el servidor (primer usuario = `administrador`, el resto `barista`).
4. La UI oculta acciones por rol (`useEsAdmin`, `SoloAdmin`), pero la seguridad real es RLS y las RPC. No confíes en el cliente.
5. Los motivos de movimiento son **exactamente**: `Compra recibida`, `Uso en preparación`, `Merma/Vencido`, `Ajuste de inventario`, `Otro`. Usa la constante `MOTIVOS` de `src/types/database.ts`.
6. Todo acceso a Supabase vive en `src/services/*.ts`. Las pantallas y componentes no importan el cliente.
7. Un único cliente: `src/lib/supabaseClient.ts`. Tipos generados en `src/types/database.types.ts` (UTF-8). No edites los tipos generados a mano.
8. Idempotencia: genera un `opId` (`generarUuid()`) al abrir el modal de movimiento/compra y **reutilízalo** en reintentos como `p_client_op_id`.
9. Baja lógica: los insumos se desactivan (`activo = false`), no se borran.
10. Secretos: nunca uses la `service_role` en la app; `.env` no se versiona; solo variables `EXPO_PUBLIC_*` en el cliente.
11. **Cambios de base de datos solo mediante archivos** en `supabase/migrations/`. Pruébalos en local (`supabase start` + `supabase db reset`). No ejecutes SQL destructivo contra el proyecto remoto.
12. Los parámetros de Expo Router son *strings*: pasa `id`, no objetos, y consulta el dato en la pantalla de destino.

## Convenciones de código
- TypeScript estricto; sin `any` en servicios y hooks.
- Nombres de dominio en español, igual que el esquema (`useInsumos`, `useRegistrarMovimiento`, `listarInsumos`).
- Componentes funcionales; estilos con `src/theme/theme.ts` (no colores sueltos); objetivos táctiles ≥ 44 pt; `accessibilityLabel` en controles.
- Cada pantalla maneja los estados **cargando / vacío / error / sin permisos**.
- Servicios devuelven `{ data, error }` con errores ya traducidos (`traducirError`).
- Estado del servidor: TanStack Query (caché persistida). Estado de cliente: Zustand.
- Rutas en `src/app` (Expo Router) delgadas: solo re-exportan pantallas de `src/features/*`.

## Estructura
```
src/app/        rutas Expo Router      src/components/  UI reutilizable
src/features/   pantallas por módulo   src/hooks/       hooks de datos
src/services/   acceso a Supabase      src/lib/         supabaseClient, queryClient, notifications
src/store/      Zustand                src/types/       database.types.ts (generado) + database.ts (dominio)
supabase/       migrations, functions, tests
```

## Comandos
```bash
npx expo start                      # desarrollo (Expo Go solo para UI básica)
npx expo run:android                # development build (mapas y push lo requieren)
npx tsc --noEmit                    # tipos
npm run lint                        # ESLint
npx jest --ci                       # pruebas de app
supabase start && supabase db reset # base local
supabase test db                    # pruebas pgTAP
```
En Windows, para generar tipos en UTF-8: `cmd /c "npx supabase gen types typescript --linked > src\types\database.types.ts"`.

## Definición de terminado
- Cumple los criterios de la fila de la tarea y las reglas de arriba.
- `tsc --noEmit` y `lint` sin errores; las pruebas relacionadas pasan.
- Sin secretos, sin `console.log` de depuración, sin código muerto.
- Estado actualizado en `tareas.md` y resumen entregado.
