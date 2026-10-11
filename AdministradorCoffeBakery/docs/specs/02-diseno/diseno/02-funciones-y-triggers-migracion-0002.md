# Fase 2 · Diseño: Funciones y triggers (migración 0002)

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: `docs/specs/README.md`


| Objeto | Tipo | Propósito |
|---|---|---|
| `es_admin()` | Función | Helper de rol para RLS |
| `manejar_nuevo_usuario()` + `al_crear_usuario` | Función + trigger en `auth.users` | Crea el perfil; primer usuario administrador; ignora metadata de rol |
| `proteger_rol()` + `perfiles_proteger_rol` | Trigger | Impide autopromoción |
| `proteger_stock()` + `insumos_proteger_stock` | Trigger | Bloquea `UPDATE` directo de `stock_actual` |
| `aplicar_movimiento()` (privada) / `registrar_movimiento()` (pública) | Función | Movimiento atómico, idempotente, con bloqueo `FOR UPDATE` |
| `al_cambiar_stock()` + `insumos_stock_bajo` | Trigger | Crea el ítem pendiente automático |
| `comprar_item()` | Función | Cierra el ítem y reintegra stock |
| `proveedores_cercanos()` | Función | Haversine, orden por distancia |
| `resumen_dashboard()`, `consumo_semanal()`, `consumo_por_insumo()` | Funciones | Dashboard y reportes |
| `insumos_tocar` | Trigger | Mantiene `actualizado_en` |

**Mejora propuesta (migración 0003):** hoy `aplicar_movimiento` busca el `client_op_id` *antes* de bloquear la fila. Si dos solicitudes idénticas llegan a la vez, la segunda falla con `23505` (la transacción completa se revierte, por lo que **no hay doble aplicación**), pero lo ideal es devolver el movimiento existente. Repetir la búsqueda del `client_op_id` *después* de `FOR UPDATE` lo resuelve. Mientras tanto, el cliente debe tratar `23505` como «reintentar para obtener el resultado».
