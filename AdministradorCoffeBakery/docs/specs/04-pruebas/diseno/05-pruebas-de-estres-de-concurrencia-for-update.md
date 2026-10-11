# Fase 4 · Pruebas: Pruebas de estrés de concurrencia (`FOR UPDATE`)

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: `docs/specs/README.md`


**Preparación** (como `postgres`, con un administrador/barista existente y un insumo `d0000000-…-d1` con **stock 1000**). **Script** `supabase/tests/concurrencia.pgbench.sql`:

```sql
BEGIN;
SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);
SELECT set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
SET LOCAL ROLE authenticated;
SELECT public.registrar_movimiento('d0000000-0000-0000-0000-0000000000d1', -1, 'Uso en preparación');
COMMIT;
```

**Ejecución:** 20 clientes × 50 transacciones = 1000 salidas de 1 unidad.

```bash
pgbench "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -n -c 20 -j 4 -t 50 -f supabase/tests/concurrencia.pgbench.sql
```

**Verificación (debe cumplirse todo):**

```sql
select
  (select stock_actual from insumos where id = 'd0000000-0000-0000-0000-0000000000d1')            as stock_final,      -- 0
  (select count(*) from movimientos_inventario where insumo_id = 'd0000000-0000-0000-0000-0000000000d1') as movimientos, -- 1000
  (select count(distinct saldo_resultante) from movimientos_inventario
    where insumo_id = 'd0000000-0000-0000-0000-0000000000d1')                                      as saldos_unicos,  -- 1000
  (select min(saldo_resultante) from movimientos_inventario
    where insumo_id = 'd0000000-0000-0000-0000-0000000000d1')                                      as saldo_minimo;   -- 0 (nunca negativo)
```

Un segundo escenario con más intentos que stock (p. ej. stock 500 y 1000 intentos) debe terminar en stock 0, 500 movimientos y el resto de las llamadas rechazadas con `stock_insuficiente`. Para tolerar errores durante el ciclo, usa `--continue-on-error` si tu versión de `pgbench` lo soporta.
