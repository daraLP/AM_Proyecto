# Fase 2 · Diseño: Contratos de API

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: `docs/specs/README.md`


| Operación | Llamada | Roles | Errores relevantes |
|---|---|---|---|
| Registro | `auth.signUp({ email, password, options:{data:{nombre}} })` | Anónimo | Correo ya registrado |
| Movimiento | `rpc('registrar_movimiento', {p_insumo_id, p_delta, p_motivo, p_nota, p_client_op_id})` | Autenticado | `23514`, `22023`, `P0002`, `42501`, `23505` |
| Compra | `rpc('comprar_item', {p_item_id, p_cantidad, p_client_op_id})` | Autenticado | `P0002`, `22023` |
| Listar insumos | `from('insumos').select(...).eq('activo', true).range(a,b)` | Autenticado | n/a |
| Crear insumo | `insert` (sin stock) + `registrar_movimiento` para stock inicial | Admin | `42501` si no es admin |
| Editar insumo | `update` **sin** `stock_actual` | Admin | `42501` |
| Cercanos | `rpc('proveedores_cercanos', {p_lat,p_lng,p_radio_km,p_insumo_id})` | Autenticado | n/a |
| Dashboard | `rpc('resumen_dashboard')`, `rpc('consumo_semanal')` | Autenticado | n/a |
| Reportes | `rpc('consumo_por_insumo', {p_desde,p_hasta})` | Admin | `42501` |
