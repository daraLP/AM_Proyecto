# Fase 4 · Pruebas: Tareas

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: [`../README.md`](../README.md)
> Leyenda: ✅ hecho y verificable · 🔄 parcial · ⬜ no encontrado · 🆕 derivada del código.

| ID | Tarea | Estado | Evidencia / entregable |
|---|---|---|---|
| QA-01 | Configurar Jest con `jest-expo`, alias y entorno aislado | ✅ | `jest.config.js`, `jest.app.config.js`, `jest.setup.js` |
| QA-02 | Pruebas unitarias de utilidades (formato, delta, errores, validación, actividad) | ✅ | `tests/*`, `__tests__/*` |
| QA-03 | Pruebas de componentes (`QuickCounter`, `ReasonChips`, `Feedback`, `Encabezado`) | ✅ | `__tests__/*.tsx` |
| QA-04 | Suite pgTAP de RLS, stock, idempotencia, compras y Haversine | ✅ | `rls_y_stock.test.sql` (`plan(26)`) |
| QA-05 | Suite pgTAP de límites de entrada | ✅ | `limites_de_entrada.test.sql` (`plan(7)`) |
| QA-06 | Pruebas de guardas de Expo Router | ⬜ | [03](diseno/03-pruebas-de-rutas-y-guardas-expo-router.md) (RT-01…RT-16) |
| QA-07 | Script de estrés `pgbench` | 🔄 | Script existe; sin resultados |
| QA-08 | Ejecutar y registrar los dos escenarios de `pgbench` | ⬜ | [05](diseno/05-pruebas-de-estres-de-concurrencia-for-update.md) |
| QA-09 | Pruebas de `useRegistrarMovimiento` (optimista, rollback) | ⬜ | — |
| QA-10 | Prueba del reintento único ante `23505` | ⬜ | — |
| QA-11 | Prueba de la cola offline (pausar/reanudar) | ⬜ | — |
| QA-12 | Pipeline de CI | ❔ | `ci.yml` existe; contenido no verificable |
| QA-13 🆕 | Corregir `npm test` para incluir `__tests__/` | ⬜ | H-19 |
| QA-14 🆕 | Añadir pgTAP de `mov_validar_delta`, `resumen_dashboard`, `consumo_semanal`, políticas de `lista_compras`/`push_tokens`/Storage y edición de insumos por barista | ⬜ | [pgTAP §4](diseno/04-pruebas-de-base-de-datos-pgtap.md) |
| QA-15 🆕 | Prueba de `clasificar` con `insumos_stock_max_chk` | ⬜ | H-13 |
| QA-16 🆕 | Definir umbral de cobertura (`coverageThreshold`) | ⬜ | — |
| QA-17 🆕 | Checklist manual en dispositivo (push, offline, mapa, fotos) | ⬜ | [requerimientos §3](requerimientos.md) |
