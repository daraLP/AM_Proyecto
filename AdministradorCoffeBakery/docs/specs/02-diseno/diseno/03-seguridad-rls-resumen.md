# Fase 2 · Diseño: Seguridad RLS (resumen)

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: `docs/specs/README.md`


| Rol | Puede | No puede |
|---|---|---|
| Administrador | CRUD de insumos (incluye desactivar), proveedores, categorías, perfiles; leer todo; reportes | Modificar `stock_actual` directamente; editar o borrar movimientos |
| Barista | Leer todo, crear y editar insumos (stock inicial 0; foto), `registrar_movimiento`, agregar ítems manuales, `comprar_item`, editar su propio nombre | Editar `stock_actual` directamente, desactivar o borrar insumos, crear/editar proveedores, cambiar su rol, insertar movimientos directamente |

Storage: bucket `fotos-insumos` (lectura autenticada; subir y reemplazar: cualquier usuario autenticado; borrar: solo `es_admin()`).
