# Fase 4 · Pruebas: Pirámide y matriz de pruebas

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: `docs/specs/README.md`


| Nivel | Herramienta | Alcance | IDs |
|---|---|---|---|
| Unitarias | Jest + `jest-expo` | `traducirError`, `generarUuid`, formato de distancia, cálculo del delta proyectado, reducers de Zustand | QA-01 |
| Hooks | `renderHook` + `QueryClientProvider` | `useRegistrarMovimiento` (optimista, rollback, error), `useAuth` | QA-02 |
| Componentes | React Native Testing Library | `QuickCounter`, `ReasonChips`, `StockBadge`, pantalla de inventario por rol | QA-03 |
| Base de datos | pgTAP (`supabase test db`) | RN-01…RN-12, RLS, triggers, RPC | QA-04…QA-06 |
| Estrés | `pgbench` | Bloqueo `FOR UPDATE` | QA-07 |
| E2E (opcional) | Maestro | Login → restar → alerta → comprar | QA-08 |
