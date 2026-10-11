# Fase 1 · Análisis: Requerimientos

> **POSCafé · Specs · Fase 1 · Análisis** · Índice general: `docs/specs/README.md`


## Reglas de negocio validadas

| ID | Regla | Mecanismo de aplicación (BD) | Mecanismo en app |
|---|---|---|---|
| RN-01 | El stock nunca es negativo. | `CHECK stock_actual >= 0` + RPC lanza `stock_insuficiente` (23514) | Stepper limita el delta a `-stock`; muestra mensaje traducido |
| RN-02 | Todo cambio de stock genera exactamente un movimiento con `saldo_resultante`. | `aplicar_movimiento` (una transacción) | Solo usa `registrar_movimiento` |
| RN-03 | El stock solo cambia por `registrar_movimiento` o `comprar_item`. | Trigger `insumos_proteger_stock`; sin política INSERT en `movimientos_inventario` | Prohibido `update` de `stock_actual` e `insert` en movimientos |
| RN-04 | Las operaciones son idempotentes por `client_op_id`. | Índice único parcial + búsqueda previa | Genera `opId` al abrir el modal y lo reutiliza en reintentos |
| RN-05 | Motivo ∈ {Compra recibida, Uso en preparación, Merma/Vencido, Ajuste de inventario, Otro}; `tipo` se deduce del signo. | CHECK + validación en RPC | Constante `MOTIVOS` |
| RN-06 | Un solo ítem pendiente por insumo en la lista de compras. | Índice único parcial `lc_un_pendiente_por_insumo` | Manejar conflicto al agregar manualmente |
| RN-07 | `stock_actual <= stock_minimo` ⇒ ítem automático; `stock_actual <= 0` ⇒ «Agotado». | Trigger `insumos_stock_bajo` + columna generada `estado_stock` | Badge por `estado_stock` |
| RN-08 | Marcar «comprado» cierra el ítem y reintegra stock (idempotente). | `comprar_item` | Modal de confirmación de cantidad |
| RN-09 | El rol no es autoasignable; el primer usuario es administrador. | `manejar_nuevo_usuario` (ignora metadata) + trigger `perfiles_proteger_rol` | `signUp` sin `rol` |
| RN-10 | Administrador: CRUD de insumos, proveedores y categorías. Barista: lectura, movimientos, agregar ítems manuales y marcar comprado. | RLS con `es_admin()` | `useEsAdmin()` oculta acciones (solo UX) |
| RN-11 | El historial es inmutable; los insumos se desactivan, no se borran. | FK `RESTRICT`; sin políticas UPDATE/DELETE | `desactivarInsumo` |
| RN-12 | El push se envía solo al insertar un ítem `origen = 'auto'`. | Webhook sobre `INSERT` + `ON CONFLICT DO NOTHING` | Edge Function filtra `origen` |
| RN-13 | Proveedores sin coordenadas no se muestran en el mapa. | `proveedores_cercanos` filtra nulos | Aviso en ficha del proveedor |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-01 | Registro e inicio de sesión con correo y contraseña. | M |
| RF-02 | Sesión persistente entre aperturas de la app. | M |
| RF-03 | Recuperación de contraseña. | C |
| RF-04 | Dashboard: total de insumos, alertas (bajo/agotado) y gráfico de consumo semanal. | M |
| RF-05 | Inventario paginado (scroll infinito) con filtros por categoría/estado y buscador. | M |
| RF-06 | Detalle de insumo con foto, unidad, stock e historial reciente. | M |
| RF-07 | Registrar movimiento con contador rápido, incrementos configurables y motivo con chips. | M |
| RF-08 | Historial de movimientos por insumo (fecha, usuario, cantidad, motivo, saldo). | M |
| RF-09 | CRUD de insumos con foto (administrador). | M |
| RF-10 | CRUD de proveedores y asociación con insumos (administrador). | M |
| RF-11 | Lista de compras: automática y manual, checkboxes, confirmación de compra con reintegro. | M |
| RF-12 | Mapa de proveedores cercanos con distancia desde la ubicación del usuario. | M |
| RF-13 | Notificación push al cruzar el umbral mínimo. | M |
| RF-14 | Reportes de stock/consumo (administrador). | S |
| RF-15 | Perfil: datos, configuración de incrementos rápidos, cerrar sesión. | M |
| RF-16 | Gestión de usuarios y roles (administrador). | S |
| RF-17 | CRUD de categorías (administrador). | S |

## Requerimientos no funcionales

| ID | Requerimiento | Métrica / criterio |
|---|---|---|
| RNF-01 | Rendimiento | Página de inventario de 20 ítems en < 1 s con red 4G; RPC `registrar_movimiento` p95 < 500 ms |
| RNF-02 | Offline | Lectura desde caché persistida; movimientos en cola con idempotencia; indicador «Sin conexión» |
| RNF-03 | Seguridad | RLS en las 8 tablas; ninguna acción sensible depende solo de la UI; claves fuera del repositorio |
| RNF-04 | Usabilidad | Registrar un movimiento en ≤ 3 toques; objetivos táctiles ≥ 44 pt |
| RNF-05 | Concurrencia | Sin condiciones de carrera: N movimientos simultáneos dan saldo exacto |
| RNF-06 | Mantenibilidad | TypeScript estricto; tipos generados de la BD; capa de servicios única |
| RNF-07 | Observabilidad | Errores de RPC traducidos al usuario y registrados en consola/servicio de errores |
| RNF-08 | Compatibilidad | Android 8+ e iOS 15+ (build de desarrollo para mapas y push) |
| RNF-09 | Accesibilidad | `accessibilityLabel` en controles del stepper; contraste AA |
