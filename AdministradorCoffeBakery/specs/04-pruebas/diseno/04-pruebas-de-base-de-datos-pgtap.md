# Fase 4 · Pruebas: Base de datos (pgTAP)

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: [`../../README.md`](../../README.md)
> Archivos: `supabase/tests/database/rls_y_stock.test.sql` y `limites_de_entrada.test.sql`. Ejecución: `npm run test:db` (`supabase test db supabase/tests/database`).

## 1. Ejecución

```bash
supabase start
supabase db reset          # aplica migraciones y seed
npm run test:db            # supabase test db supabase/tests/database
```

Las pruebas corren en una transacción que se revierte. Los datos de prueba usan UUID fijos (p. ej. insumo `d0000000-0000-0000-0000-0000000000d1`) y simulan usuarios con `request.jwt.claims` y `SET LOCAL ROLE authenticated`.

## 2. `rls_y_stock.test.sql` — `plan(26)`

El plan coincide con el contenido: la numeración llega a 24 y el caso 14 aporta 3 aserciones (+2), lo que da 26.

| # | Qué comprueba | Mecanismo bajo prueba | Regla |
|---|---|---|---|
| 1 | El alta ignora el rol enviado por el cliente | `manejar_nuevo_usuario` | RN-09 |
| 2 | Un barista no se autopromueve | `perfiles_proteger_rol` | RN-09 |
| 3-4 | Entrada de 10 correcta; stock 10 | `registrar_movimiento` | RN-02 |
| 5-6 | Salida de 6 → stock 4 → estado `bajo` | columna generada | RN-07 |
| 7 | El trigger crea exactamente un pendiente automático | `insumos_stock_bajo` | RN-06/07 |
| 8-9 | Otra salida no duplica el pendiente | `ON CONFLICT DO NOTHING` | RN-06 |
| 10-11 | Stock insuficiente: error y sin cambios (atomicidad) | `aplicar_movimiento` | RN-01 |
| 12 | Motivo inválido | validación (`22023`) | RN-05 |
| 13 | `INSERT` directo en movimientos denegado | RLS | RN-03/11 |
| 14 (×3) | Barista crea insumo con stock 0; no con stock > 0; no puede desactivar | `baristas_crean_insumos`, `WITH CHECK` | RN-10 |
| 15-16 | Idempotencia: misma operación dos veces = un movimiento, un efecto | `client_op_id` | RN-04 |
| 17 | Ni el administrador edita el stock por `UPDATE` | `insumos_proteger_stock` | RN-03 |
| 18-19 | Compra cierra el ítem y reintegra (sugerido 2·5−4 = 6) | `comprar_item` | RN-08 |
| 20-21 | Comprar de nuevo no suma otra vez | idempotencia de `comprar_item` | RN-08 |
| 22 | Reportes solo para administradores | `consumo_por_insumo` (`42501`) | RN-10 |
| 23-24 | Haversine: orden por distancia y filtro por radio (`32.5, −117.0`, 50 km y 10 km) | `proveedores_cercanos` | RN-13 |

## 3. `limites_de_entrada.test.sql` — `plan(7)`

| # | Aserción | Verifica |
|---|---|---|
| 1 | `throws_ok` nombre de insumo de 200 caracteres | `CHECK` de longitud |
| 2 | `throws_ok` nombre de solo espacios | `CHECK` de contenido |
| 3 | `throws_ok` `stock_minimo = 1000000` | Tope 999 999 |
| 4 | `throws_ok` categoría de 41 caracteres | Longitud ≤ 40 |
| 5 | `throws_ok` proveedor con latitud 120 | Rango de coordenadas |
| 6 | `lives_ok` nombre de 80 caracteres | Límite inclusivo |
| 7 | `lives_ok` proveedor con teléfono y dirección válidos | Caso feliz |

## 4. Cobertura y brechas

| Objeto | ¿Cubierto? |
|---|---|
| `registrar_movimiento`, `aplicar_movimiento`, `comprar_item` | ✅ |
| `insumos_proteger_stock`, `perfiles_proteger_rol`, `manejar_nuevo_usuario` | ✅ |
| `insumos_stock_bajo` | ✅ (no cubre el alta con stock 0, H-02) |
| `proveedores_cercanos` | ✅ |
| `consumo_por_insumo` | ✅ (solo denegación; no el cálculo) |
| `resumen_dashboard`, `consumo_semanal` | ⬜ |
| `mov_validar_delta` (22003) | ⬜ (no aparece en las 7 aserciones) |
| Políticas de `lista_compras` (`insertar_lista_manual`), `push_tokens`, `storage.objects` | ⬜ |
| Barista edita insumo activo (`baristas_editan_insumos`) | ⬜ |
| Carrera de idempotencia (H-04) | ⬜ (ver estrés) |
