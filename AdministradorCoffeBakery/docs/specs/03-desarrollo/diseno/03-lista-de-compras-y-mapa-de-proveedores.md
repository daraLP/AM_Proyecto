# Fase 3 · Desarrollo: Lista de Compras y Mapa de Proveedores

> **POSCafé · Specs · Fase 3 · Desarrollo** · Índice general: `docs/specs/README.md`


| Aspecto | Especificación |
|---|---|
| Lista | Pendientes ordenados por fecha; cada ítem: insumo, cantidad sugerida, proveedor, origen (auto/manual) |
| Compra | Checkbox → `ConfirmarCompraModal` (cantidad editable) → `comprar_item` con `opId` |
| Manual | Selector de insumo + cantidad; el conflicto del índice único se informa («Ya hay un pendiente para este insumo») |
| Mapa | `react-native-maps` con `MapView`, `showsUserLocation`, un `Marker` por proveedor (`latitud`/`longitud`); callout con nombre y distancia |
| Distancia | Calculada en `proveedores_cercanos` (Haversine, metros). Formato: `< 1000 m` → «850 m»; si no, «2.3 km» |
| Permisos | `expo-location` *when-in-use*; si se deniega, mapa sin distancia |
| Ficha | `ProveedorDetalle`: contacto, insumos asociados, botón «Agregar a la lista» |
