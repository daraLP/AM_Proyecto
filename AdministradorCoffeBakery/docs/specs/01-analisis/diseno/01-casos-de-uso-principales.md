# Fase 1 · Análisis: Casos de uso principales

> **POSCafé · Specs · Fase 1 · Análisis** · Índice general: `docs/specs/README.md`


**CU-01: Contador rápido (registrar movimiento)**

| Campo | Contenido |
|---|---|
| Actores | Barista, Administrador |
| Precondición | Sesión activa; insumo activo |
| Flujo principal | 1) Abre el detalle del insumo. 2) Ajusta el delta con −/+, chips (+1/+5/+10) o escribiendo. 3) Pulsa Confirmar. 4) Elige el motivo con un chip. 5) La app llama a `registrar_movimiento` con un `opId`. 6) Se actualiza el stock y el historial. |
| Flujos alternos | A) Sin red: la mutación queda en cola y se reenvía. B) `stock_insuficiente`: mensaje y recálculo con el stock actual. C) Motivo «Otro»: nota opcional. |
| Postcondición | Un movimiento con `saldo_resultante`; stock actualizado; posible alerta (CU-02) |

**CU-02: Alerta de stock bajo**

| Campo | Contenido |
|---|---|
| Disparador | `stock_actual <= stock_minimo` tras un movimiento |
| Flujo | Trigger inserta ítem `auto` (o lo omite si ya hay pendiente) → Webhook → Edge Function → Expo Push → todos los dispositivos con token |
| Resultado | Insumo marcado `bajo`/`agotado`; ítem pendiente; notificación con deep link a Compras |

**CU-03: Compra y reintegro**

| Campo | Contenido |
|---|---|
| Flujo principal | Marca el checkbox → modal con cantidad (por defecto la sugerida) → `comprar_item` → ítem `comprado` + movimiento «Compra recibida» |
| Alterno | Compra parcial: si el stock sigue ≤ mínimo, el trigger crea un nuevo pendiente |
| Idempotencia | Repetir la llamada no vuelve a sumar |

**CU-04: Proveedores cercanos (geolocalización)**

| Campo | Contenido |
|---|---|
| Flujo | Solicita permiso «en uso» → obtiene posición → `proveedores_cercanos(lat, lng, radio, insumo?)` → marcadores y distancia → ficha con insumos asociados → agregar a la lista |
| Alterno | Permiso denegado: mapa centrado en el proveedor preferido, sin distancia |

**CU-05: Registro y rol.** Registro con nombre/correo/contraseña → el servidor crea el perfil (primer usuario `administrador`, resto `barista`) → si hay confirmación de correo, se informa.

**CU-06: Administración.** El administrador crea/edita/desactiva insumos (stock inicial por movimiento), proveedores (con coordenadas y asociaciones), categorías y usuarios (cambia roles).
