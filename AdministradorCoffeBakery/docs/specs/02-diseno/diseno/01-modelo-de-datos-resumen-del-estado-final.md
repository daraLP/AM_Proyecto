# Fase 2 · Diseño: Modelo de datos (resumen del estado final)

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: `docs/specs/README.md`


| Tabla | Columnas clave | Notas |
|---|---|---|
| `perfiles` | `id` (FK `auth.users`), `nombre`, `rol` | Alta por trigger; rol protegido |
| `categorias` | `id`, `nombre` (único) | CRUD admin |
| `proveedores` | `id`, `nombre`, `telefono`, `direccion`, `latitud`, `longitud` | Haversine; sin PostGIS |
| `insumos` | `id`, `nombre`, `categoria_id`, `unidad_medida`, `stock_actual`, `stock_minimo`, `proveedor_principal_id`, `foto_url`, `activo`, `estado_stock` (generada) | Stock solo por RPC |
| `proveedor_insumos` | PK (`proveedor_id`, `insumo_id`) | N:M |
| `movimientos_inventario` | `insumo_id`, `usuario_id`, `tipo`, `cantidad`, `motivo`, `nota`, `saldo_resultante`, `client_op_id` | Inmutable; FK `RESTRICT` |
| `lista_compras` | `insumo_id`, `proveedor_id`, `cantidad_sugerida`, `estado`, `origen`, `cantidad_comprada`, `comprado_por`, `comprado_en`, `creado_por` | Índice único parcial de pendientes |
| `push_tokens` | `usuario_id`, `token` (único), `plataforma` | RLS por propietario |
