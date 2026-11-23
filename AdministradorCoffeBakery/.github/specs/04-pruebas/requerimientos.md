# Fase 4 · Pruebas: Requerimientos

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: [`../README.md`](../README.md)
> Criterios de aceptación transversales (CT) y requisitos de calidad (RQ), con el estado de verificación real.

## 1. Criterios de aceptación transversales

| ID | Criterio | Verificación existente | Estado |
|---|---|---|---|
| CT-01 | **No negativo:** ninguna secuencia de operaciones deja stock < 0. | pgTAP 10-11; `acotarDelta`; pgbench escenario 2 (sin resultados) | 🔄 |
| CT-02 | **Atomicidad:** un fallo no deja cambios parciales. | pgTAP 10-11 | ✅ |
| CT-03 | **Idempotencia:** repetir `client_op_id` no duplica efecto. | pgTAP 15-16, 20-21 | ✅ |
| CT-04 | **Autorización:** el barista no ejecuta acciones de administrador (ni por UI ni por API). | pgTAP 2, 13, 14, 17, 22; UI sin prueba | 🔄 |
| CT-05 | **Concurrencia:** N movimientos simultáneos producen saldo exacto y `saldo_resultante` único. | `concurrencia.pgbench.sql` | 🔄 (sin ejecución registrada) |
| CT-06 | **Límites de entrada** en cliente y BD. | `validacion.test.ts`; `limites_de_entrada.test.sql` | ✅ |
| CT-07 | **Mensajes de error** claros, sin jerga ni texto técnico. | `errores.test.ts` (tono) | ✅ |
| CT-08 | **Sin doble envío** por toques repetidos. | `envioUnico.test.ts` | ✅ |
| CT-09 | **Offline:** un movimiento sin conexión se aplica al reconectar sin duplicarse. | — | ⬜ |
| CT-10 | **Guardas de navegación** correctas por sesión y rol. | — | ⬜ |
| CT-11 | **Tiempo de respuesta** del contador percibido inmediato (optimista). | — (revisión manual) | ⬜ |
| CT-12 | **Accesibilidad básica** (roles y etiquetas). | `QuickCounter`, `ReasonChips`, `Feedback` (parcial) | 🔄 |

## 2. Requisitos de calidad de las pruebas

| ID | Requisito | Estado |
|---|---|---|
| RQ-01 | Las pruebas no deben conectarse a un Supabase real. | ✅ `jest.setup.js` con valores falsos |
| RQ-02 | `npm test` debe ejecutar todas las pruebas Jest. | ⬜ (H-19) |
| RQ-03 | pgTAP reversible (`begin … rollback`). | ✅ |
| RQ-04 | Pruebas de regresión para defectos corregidos. | ✅ (`utils_baseline`) |
| RQ-05 | Umbral de cobertura definido. | ⬜ |
| RQ-06 | Ejecución automática en CI. | ❔ (`ci.yml` no verificable) |
| RQ-07 | Pruebas de seguridad de RLS para todas las tablas. | 🔄 (ver [pgTAP §4](diseno/04-pruebas-de-base-de-datos-pgtap.md)) |

## 3. Casos manuales recomendados (sin automatizar)

| ID | Caso | Pasos resumidos |
|---|---|---|
| M-01 | Movimiento sin conexión | Modo avión → registrar salida → reconectar → verificar un solo movimiento |
| M-02 | Push | Dispositivo físico, salida que cruza el mínimo, verificar notificación y *deep link* a `/compras` |
| M-03 | Realtime | Dos dispositivos: un cambio de stock se refleja en el otro |
| M-04 | Permisos de barista | Verificar ausencia de «Desactivar» y de rutas de administración |
| M-05 | Foto | Subir imagen > 2 MiB y formato no admitido (mensajes `fotoPesada`/`fotoFormato`) |
| M-06 | Mapa | Permiso denegado → diálogo con «Abrir Ajustes» |
| M-07 | Etiquetas del gráfico | Confirmar H-01 en dispositivo |
