# Fase 4 · Pruebas: Estrés de concurrencia (`FOR UPDATE`)

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: [`../../README.md`](../../README.md)
> Archivo real: `supabase/tests/concurrencia.pgbench.sql` (contenido verificado). Los parámetros de ejecución y los resultados esperados provienen de los documentos históricos y **no hay resultados registrados** (H-14).

## 1. Objetivo

Demostrar que, con muchos clientes concurrentes sobre el mismo insumo, `aplicar_movimiento` (que toma `SELECT … FOR UPDATE` sobre `insumos`) conserva el invariante RN-01/RN-02: stock exacto, un movimiento por llamada con `saldo_resultante` único y nunca negativo.

## 2. Script `concurrencia.pgbench.sql`

```sql
BEGIN;
SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);
SELECT set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
SET LOCAL ROLE authenticated;
SELECT public.registrar_movimiento('d0000000-0000-0000-0000-0000000000d1', -1, 'Uso en preparación');
COMMIT;
```

Cada transacción simula al administrador `a0000000-…-0001` y descuenta 1 unidad del insumo `d0000000-…-00d1`. **No** envía `p_client_op_id`, por lo que no ejercita la idempotencia.

## 3. Preparación (como `postgres`)

1. Existe un usuario administrador `a0000000-0000-0000-0000-000000000001` (perfil con rol `administrador`).
2. Existe el insumo `d0000000-0000-0000-0000-0000000000d1` con stock inicial controlado (1000 para el escenario 1; 500 para el 2).
3. Sin movimientos previos sobre ese insumo, para que los conteos sean exactos.

> Los fixtures no los crea el script; se preparan a mano o con una variante de las fixtures de pgTAP (se revierten allí, por lo que no sirven directamente).

## 4. Escenarios

| Escenario | Parámetros | Resultado esperado |
|---|---|---|
| 1. Stock suficiente | stock 1000; `pgbench … -n -c 20 -j 4 -t 50 -f supabase/tests/concurrencia.pgbench.sql` (20 clientes × 50 = 1000 salidas) | `stock_final = 0`; 1000 movimientos; 1000 `saldo_resultante` distintos; `saldo_minimo = 0` |
| 2. Más intentos que stock | stock 500; 1000 intentos | `stock_final = 0`; 500 movimientos; el resto de llamadas rechazadas con `stock_insuficiente` (`23514`); usar `--continue-on-error` si la versión de `pgbench` lo soporta |

```bash
pgbench "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -n -c 20 -j 4 -t 50 -f supabase/tests/concurrencia.pgbench.sql
```

## 5. Verificación

```sql
select
  (select stock_actual from insumos where id = 'd0000000-0000-0000-0000-0000000000d1') as stock_final,
  (select count(*) from movimientos_inventario where insumo_id = 'd0000000-0000-0000-0000-0000000000d1') as movimientos,
  (select count(distinct saldo_resultante) from movimientos_inventario
    where insumo_id = 'd0000000-0000-0000-0000-0000000000d1') as saldos_unicos,
  (select min(saldo_resultante) from movimientos_inventario
    where insumo_id = 'd0000000-0000-0000-0000-0000000000d1') as saldo_minimo;
```

## 6. Mecanismo bajo prueba

```mermaid
sequenceDiagram
  participant C1 as Cliente 1
  participant C2 as Cliente 2
  participant DB as insumos (fila)
  C1->>DB: SELECT … FOR UPDATE (obtiene el bloqueo)
  C2->>DB: SELECT … FOR UPDATE (espera)
  C1->>DB: UPDATE stock, INSERT movimiento (saldo n−1)
  C1-->>DB: COMMIT (libera)
  DB-->>C2: lee stock actualizado
  C2->>DB: UPDATE stock, INSERT movimiento (saldo n−2)
```

## 6.1 Casos no cubiertos

| Caso | Motivo |
|---|---|
| Carrera con el mismo `client_op_id` (H-04) | El script no envía `p_client_op_id`; requeriría una variante con identificador fijo y comprobar que la segunda falla con `23505` sin doble efecto |
| Concurrencia de `comprar_item` sobre el mismo ítem | `FOR UPDATE` sobre `lista_compras`; sin script |
| Entradas y salidas mezcladas | Sin script |

## 7. Estado

| Elemento | Estado |
|---|---|
| Script | ✅ existe |
| Resultados de una ejecución | ⬜ no registrados |
| Integración en CI | ⬜ (contenido de `ci.yml` no verificable) |
