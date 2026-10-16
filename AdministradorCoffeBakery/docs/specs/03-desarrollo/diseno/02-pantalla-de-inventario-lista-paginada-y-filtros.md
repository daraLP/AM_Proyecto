# Fase 3 · Desarrollo: Pantalla de Inventario (lista paginada y filtros)

> **POSCafé · Specs · Fase 3 · Desarrollo** · Índice general: `docs/specs/README.md`


| Aspecto | Especificación |
|---|---|
| Datos | `listarInsumosPaginado({ pagina, categoriaId?, busqueda?, estado? })` con `.range(p*20, p*20+19)` |
| Scroll | `onEndReached` (umbral 0.5) + indicador de carga al final |
| Filtros | Chips de categoría (desde `categorias`) y de estado (Todos / Bajo / Agotado) |
| Búsqueda | `ilike('nombre', '%q%')` con *debounce* de 300 ms |
| Fila | `InsumoCard` memoizada: nombre, stock + unidad, `StockBadge` por `estado_stock`, foto |
| Permisos | «+ Agregar» y «Editar» para todos los usuarios; «Desactivar» solo para `useEsAdmin()`; toque en la fila abre `InsumoDetalle` |
