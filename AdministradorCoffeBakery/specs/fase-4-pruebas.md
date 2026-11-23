# Fase 4 · Pruebas

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: [`README.md`](README.md)

## 1. Documentos

| Documento | Contenido |
|---|---|
| [`01-piramide-y-matriz`](04-pruebas/diseno/01-piramide-y-matriz-de-pruebas.md) | Inventario real y matriz regla ↔ prueba |
| [`02-pruebas-unitarias…`](04-pruebas/diseno/02-pruebas-unitarias-y-de-componentes-jest.md) | Configuración y casos Jest |
| [`03-pruebas-de-rutas…`](04-pruebas/diseno/03-pruebas-de-rutas-y-guardas-expo-router.md) | Brecha y casos propuestos (RT-01…RT-16) |
| [`04-pruebas-de-base-de-datos-pgtap`](04-pruebas/diseno/04-pruebas-de-base-de-datos-pgtap.md) | 26 + 7 aserciones |
| [`05-pruebas-de-estres…`](04-pruebas/diseno/05-pruebas-de-estres-de-concurrencia-for-update.md) | Script pgbench y escenarios |
| [`06-pipeline-de-ci…`](04-pruebas/diseno/06-pipeline-de-ci-github-actions.md) | Scripts reales y pipeline propuesto |
| [`requerimientos.md`](04-pruebas/requerimientos.md) · [`tareas.md`](04-pruebas/tareas.md) | CT-01…CT-12, RQ-01…RQ-07, QA-01…QA-17 |

## 2. Inventario

| Capa | Ubicación | Contenido |
|---|---|---|
| Jest (componentes y unitarias) | `__tests__/` | 9 archivos |
| Jest (unitarias) | `tests/` | 4 archivos |
| pgTAP | `supabase/tests/database/` | `rls_y_stock` (26), `limites_de_entrada` (7) |
| Estrés | `supabase/tests/concurrencia.pgbench.sql` | 1 script |

## 3. Hallazgos de calidad

| ID | Hallazgo |
|---|---|
| H-14 | Sin pruebas de guardas, `useRegistrarMovimiento`, cola offline, Login/Register ni pantallas; pgbench sin resultados |
| H-19 | `npm test` usa `jest.app.config.js` (solo `tests/**/*.test.ts`) y omite `__tests__/` |

## 4. Comandos

```bash
npx jest                 # todo Jest
npm test                 # solo tests/ (H-19)
npm run test:db          # pgTAP
pgbench … -f supabase/tests/concurrencia.pgbench.sql   # estrés
```
