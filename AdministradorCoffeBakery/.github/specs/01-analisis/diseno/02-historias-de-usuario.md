# Fase 1 · Análisis: Historias de usuario y criterios de aceptación clave

> **POSCafé · Specs · Fase 1 · Análisis** · Índice general: [`../../README.md`](../../README.md)
> Los criterios `CA-01…CA-10` provienen de las historias históricas; `CA-11…CA-17` (transversales) están en [`04-pruebas/requerimientos.md`](../../04-pruebas/requerimientos.md); `CA-18…` 🆕 cubren comportamiento implementado que no tenía criterio. La columna **Verificación** indica si hay una prueba automática real.

## 1. Historias

| ID | Historia | Criterios (Dado / Cuando / Entonces) | Verificación |
|---|---|---|---|
| HU-01 | Como **barista** quiero restar stock con un gesto para registrar el uso sin llenar formularios. | **CA-01** Dado un insumo con stock 10, cuando resto 6 con motivo «Uso en preparación», entonces el stock es 4 y el historial muestra saldo 4. **CA-02** Cuando intento restar más que el stock, entonces veo un mensaje y el stock no cambia. | CA-01: `tests/utils.test.ts` («CA-01: stock 10 − 6 = 4»), `__tests__/utils.test.ts`, pgTAP casos 5-6; CA-02: `QuickCounter.test.tsx` («no permite restar más que el stock actual»), pgTAP casos 10-11 |
| HU-02 | Como **dueño** quiero ser avisado cuando algo se acaba. | **CA-03** Cuando el stock cruza el mínimo, entonces aparece un solo ítem pendiente y llega una notificación. **CA-04** Dos movimientos bajo el mínimo no duplican el ítem. | CA-04: pgTAP casos 7-9. CA-03 (push): manual (QA-11) |
| HU-03 | Como **encargado** quiero marcar una compra y que se reponga el stock. | **CA-05** Cuando confirmo la compra de 6, entonces el stock sube 6 y el ítem queda «comprado». **CA-06** Confirmar dos veces no suma dos veces. | pgTAP casos 18-21 |
| HU-04 | Como **administrador** quiero que nadie se autopromueva. | **CA-07** Un `signUp` con `rol: 'administrador'` crea un barista. **CA-08** Un barista no puede cambiar su rol. | pgTAP casos 1-2 |
| HU-05 | Como **barista** quiero ver proveedores cercanos. | **CA-09** Con permiso, el mapa muestra proveedores ordenados por distancia. **CA-10** Sin permiso, la app sigue funcionando. | CA-09 (orden): pgTAP casos 23-24; resto: manual (QA-10) |
| HU-06 🆕 | Como **barista** quiero crear y editar insumos para no depender del administrador. | **CA-18** Dado un barista, cuando crea un insumo con stock inicial 5, entonces el insumo existe con `stock_actual = 0` y un movimiento «Ajuste de inventario / Stock inicial» lo lleva a 5. **CA-19** Un barista no puede desactivar un insumo ni crearlo con stock directo. | CA-19: pgTAP casos 14 (3 aserciones); CA-18: manual |
| HU-07 🆕 | Como **usuario** quiero registrar un movimiento sin internet y que se aplique al reconectar. | **CA-20** Dado el modo avión, cuando pulso «Registrar», entonces veo «Guardado sin conexión» y, al volver la red, el stock se actualiza una sola vez (mismo `opId`). | Manual (QA-13); idempotencia: pgTAP casos 15-16 |
| HU-08 🆕 | Como **usuario** quiero mensajes claros cuando algo falla. | **CA-21** Ningún error muestra texto técnico (`SQLSTATE`, `jwt`, `RLS`…). **CA-22** Los mensajes son ≤ 150 caracteres y terminan en punto. | `__tests__/errores.test.ts` |
| HU-09 🆕 | Como **usuario** quiero que un doble toque no duplique una acción. | **CA-23** Dos toques seguidos en «Guardar»/«Registrar» ejecutan la acción una vez; si la promesa falla, el botón se libera. | `tests/envioUnico.test.ts` |
| HU-10 🆕 | Como **administrador** quiero ubicar un proveedor sin escribir coordenadas. | **CA-24** Dada una dirección, cuando pulso «Buscar en el mapa», entonces se coloca el pin; si no se encuentra, veo cómo continuar (agregar ciudad o colocar el pin a mano). | `__tests__/geocodificacion.test.ts` |
| HU-11 🆕 | Como **administrador** quiero evitar datos corruptos o desmesurados. | **CA-25** Un insumo de 200 letras, un mínimo de 1 000 000, una categoría de 41 caracteres o una latitud 120 son rechazados por la BD; el límite exacto (80 letras) pasa. | `supabase/tests/database/limites_de_entrada.test.sql` (7 pruebas); `tests/validacion.test.ts` |
| HU-12 🆕 | Como **barista** quiero saber qué hizo el equipo. | **CA-26** «Actividad del equipo» muestra quién (o «Tú»/«Alguien»), qué y cuánto hace. | `__tests__/actividad.test.ts` |
| HU-13 🆕 | Como **administrador** quiero gestionar roles y categorías sin riesgo para los baristas. | **CA-27** Un barista que abre `/perfil/usuarios`, `/perfil/categorias` o `/dashboard/reports` es redirigido a `/dashboard`. **CA-28** `consumo_por_insumo` para un barista lanza `42501`. | CA-28: pgTAP caso 22; CA-27: manual (sin prueba de guardas, H-14) |
| HU-14 🆕 | Como **usuario** quiero adaptar los chips del contador a mi forma de trabajar. | **CA-29** Dado «2, 2, 5, 10, 20, 50», al guardar, quedan `2, 5, 10, 20` (únicos, máx. 4). **CA-30** «Restablecer» vuelve a `1, 5, 10`. | Sin prueba automática del store (`useUiStore.normalizar` no exportada) |

## 2. Detalle de criterios nuevos

### CA-18 · Stock inicial por movimiento
1. **Dado** un barista en `/inventario/form` con «Stock inicial» = 5 y mínimo = 2.
2. **Cuando** pulsa «Guardar Insumo».
3. **Entonces** `INSERT insumos` (sin `stock_actual`, la política `baristas_crean_insumos` exige 0) y luego `registrar_movimiento(+5, 'Ajuste de inventario', 'Stock inicial')`; el historial muestra el movimiento y `estado_stock = 'ok'`.
4. **Y si** el movimiento falla, el mensaje es «El insumo se creó, pero no se registró el stock inicial: …».

### CA-20 · Cola offline
1. **Dado** el dispositivo sin conexión (`onlineManager.isOnline() === false`).
2. **Cuando** el usuario pulsa «Registrar».
3. **Entonces** la mutación `["registrar-movimiento"]` queda pausada con sus variables (incluido `opId`), el banner superpuesto «Sin conexión · tus cambios se enviarán al reconectar» está visible y el modal se cierra.
4. **Al reconectar**, `resumePausedMutations()` reenvía el movimiento; una repetición del mismo `opId` no vuelve a aplicarse (CA-12).

### CA-27 · Guardas por rol
1. **Dado** un barista autenticado.
2. **Cuando** navega (p. ej., por enlace) a `/perfil/usuarios`, `/perfil/categorias` o `/dashboard/reports`.
3. **Entonces** `SoloAdmin` renderiza `<Redirect href="/dashboard" />`.
4. **Y** `/compras/proveedor/nuevo` devuelve atrás con `router.back()` (efecto en `ProveedorDetalleScreen`).
