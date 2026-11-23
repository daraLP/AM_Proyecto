# Fase 1 · Análisis

> **POSCafé · Specs · Fase 1 · Análisis** · Índice general: [`README.md`](README.md)

## 1. Documentos

| Documento | Contenido |
|---|---|
| [`01-analisis/requerimientos.md`](01-analisis/requerimientos.md) | RN-01…RN-20, RF-01…RF-22, RNF-01…RNF-13 y cobertura |
| [`01-analisis/diseno/01-casos-de-uso-principales.md`](01-analisis/diseno/01-casos-de-uso-principales.md) | CU-01…CU-15 con diagramas |
| [`01-analisis/diseno/02-historias-de-usuario.md`](01-analisis/diseno/02-historias-de-usuario.md) | HU-01…HU-14 y CA-01…CA-30 |
| [`01-analisis/diseno/03-matriz-de-trazabilidad.md`](01-analisis/diseno/03-matriz-de-trazabilidad.md) | RF ↔ RN ↔ CU ↔ componente ↔ prueba |
| [`01-analisis/tareas.md`](01-analisis/tareas.md) | A-01…A-15 |

## 2. Reglas de negocio destacadas

| Regla | Esencia |
|---|---|
| RN-01 | El stock nunca es negativo |
| RN-02/03 | Todo cambio de stock = un movimiento; solo por `registrar_movimiento` / `comprar_item` |
| RN-04 | Idempotencia por `client_op_id` |
| RN-06/07 | Un pendiente por insumo; sugerido `max(2·mín − stock, 1)` |
| RN-09/10 | Rol no autoasignable; permisos por rol (**evolución ADR-08**: barista crea/edita insumos) |
| RN-14 | Límites de entrada (`999 999`, 3 decimales, longitudes) |

## 3. Cobertura funcional

**22 RF:** 20 implementados, 1 parcial (RF-08: historial acotado a 5 por insumo y 50 global) y 1 no implementado (RF-03: recuperación de contraseña).

## 4. Casos de uso

| ID | Caso de uso |
|---|---|
| CU-01 | Contador rápido (registrar movimiento) |
| CU-02 | Alerta de stock bajo |
| CU-03 | Compra y reintegro |
| CU-04 | Proveedores cercanos (geolocalización) |
| CU-05 | Registro |
| CU-06 | Administración de insumos |
| CU-07 🆕 | Actividad del equipo |
| CU-08 🆕 | Reportes de consumo (solo administrador) |
| CU-09 🆕 | Gestión de usuarios y roles (solo administrador) |
| CU-10 🆕 | Gestión de categorías (solo administrador) |
| CU-11 🆕 | Alta y edición de proveedores (solo administrador) |
| CU-12 🆕 | Foto de insumo |
| CU-13 🆕 | Perfil e incrementos rápidos |
| CU-14 🆕 | Sesión y cierre de sesión |
| CU-15 🆕 | Alta manual en la lista de compras |

Los diagramas (actores, secuencias de CU-01 y CU-02) están en el [documento de casos de uso](01-analisis/diseno/01-casos-de-uso-principales.md).

## 5. Brechas de análisis abiertas

A-06 (procedimiento del administrador), A-07 (stock 0 al crear), A-13 (RF-03), A-14 (RF-08) y A-15 (webhook y secretos).
