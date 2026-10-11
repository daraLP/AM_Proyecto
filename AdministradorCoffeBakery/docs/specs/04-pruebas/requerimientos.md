# Fase 4 · Pruebas: Requerimientos

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: `docs/specs/README.md`


## Criterios de aceptación transversales

| ID | Criterio | Verificación |
|---|---|---|
| CA-11 | **Atomicidad:** si el movimiento falla, ni el stock ni el historial cambian. | pgTAP |
| CA-12 | **Idempotencia:** el mismo `client_op_id` aplica una sola vez. | pgTAP |
| CA-13 | **No negativo:** ninguna secuencia de operaciones deja stock < 0. | pgTAP + concurrencia |
| CA-14 | **Seguridad:** un barista no puede insertar movimientos, editar insumos, cambiar su rol ni ejecutar reportes; nadie hace `UPDATE` directo de stock. | pgTAP |
| CA-15 | **Consistencia visual:** el badge coincide con `estado_stock` (ok/bajo/agotado) en lista, detalle y dashboard. | Componentes |
| CA-16 | **Concurrencia:** N movimientos simultáneos producen saldo exacto y `saldo_resultante` único por movimiento. | Estrés |
| CA-17 | **Offline:** un movimiento hecho sin red se aplica una sola vez al reconectar. | Integración |

| Cobertura objetivo | Meta |
|---|---|
| Lógica de negocio y hooks (Jest) | ≥ 80 % |
| Rutas críticas SQL (RLS, RPC, triggers) | 100 % |
