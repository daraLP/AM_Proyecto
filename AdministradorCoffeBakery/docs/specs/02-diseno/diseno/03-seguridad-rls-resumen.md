# Fase 2 · Diseño: Seguridad RLS (resumen)

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: `docs/specs/README.md`


| Rol | Puede | No puede |
|---|---|---|
| Administrador | CRUD de insumos, proveedores, categorías, perfiles; leer todo; reportes | Modificar `stock_actual` directamente; editar o borrar movimientos |
| Barista | Leer todo, `registrar_movimiento`, agregar ítems manuales, `comprar_item`, editar su propio nombre | Crear/editar insumos o proveedores, cambiar su rol, insertar movimientos directamente |

Storage: bucket `fotos-insumos` (lectura autenticada; escritura solo `es_admin()`).
