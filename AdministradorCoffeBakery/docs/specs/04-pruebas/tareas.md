# Fase 4 · Pruebas: Tareas

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: `docs/specs/README.md`


| ID | Tarea | Estado | Criterio |
|---|---|---|---|
| QA-01 | Pruebas unitarias de utilidades (`traducirError`, `generarUuid`, formato de distancia, delta proyectado) | ⬜ | Cobertura ≥ 80 % del módulo |
| QA-02 | Pruebas de hooks `useRegistrarMovimiento` y `useAuth` con servicios mockeados | ⬜ | Optimista, rollback y error cubiertos |
| QA-03 | Pruebas de componentes: `QuickCounter`, `ReasonChips`, `StockBadge`, `InventarioListScreen` por rol | ⬜ | CA-01, CA-02, CA-15 |
| QA-04 | Suite pgTAP `rls_y_stock.test.sql` (24 pruebas) | ⬜ | Todas en verde |
| QA-05 | Pruebas pgTAP de RLS para `perfiles`, `proveedores`, `categorias` y `lista_compras` (insert manual vs `auto`) | ⬜ | CA-14 |
| QA-06 | Pruebas SQL de `resumen_dashboard` y `consumo_semanal` con datos conocidos | ⬜ | Conteos exactos |
| QA-07 | Prueba de estrés de concurrencia con `pgbench` (dos escenarios) | ⬜ | CA-13 y CA-16 |
| QA-08 | Prueba de idempotencia concurrente (mismo `client_op_id` en paralelo; esperado: sin doble aplicación, error `23505` o resultado existente) | ⬜ | CA-12 |
| QA-09 | Prueba manual de flujo de compra parcial (el trigger genera un nuevo pendiente) | ⬜ | Documentada |
| QA-10 | Prueba manual de mapa: permiso concedido, denegado y proveedor sin coordenadas | ⬜ | CA-09, CA-10 |
| QA-11 | Prueba de push de extremo a extremo en dispositivo real (build de desarrollo) | ⬜ | CA-03 |
| QA-12 | Prueba de sesión persistente (cerrar y reabrir la app; token vencido y renovado) | ⬜ | RF-02 |
| QA-13 | Prueba de cola offline: movimiento en modo avión y reconexión | ⬜ | CA-17 |
| QA-14 | Configurar CI de GitHub Actions (job `app` y job `db`) | ⬜ | Pipeline verde en `main` |
| QA-15 | Prueba de regresión de seguridad: `signUp` con `rol` en metadata | ✅ | Cubierta por la prueba 1 de pgTAP y la corrección aplicada |
| QA-16 | Revisión de rendimiento: p95 de `registrar_movimiento` y carga de la primera página de inventario | ⬜ | RNF-01 |
| QA-17 | Pruebas de guardas de Expo Router (`expo-router/testing-library`): sin sesión, perfil no cargado, barista en rutas admin | ⬜ | Todas las rutas «solo administrador» redirigen |
| QA-18 | Matriz manual de roles: recorrer cada ruta como administrador y como barista y verificar visibilidad de botones y respuesta de RLS | ⬜ | Coincide con la tabla de rutas de §2.2 |
