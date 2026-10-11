# Fase 1 · Análisis: Tareas

> **POSCafé · Specs · Fase 1 · Análisis** · Índice general: `docs/specs/README.md`


| ID | Tarea | Estado | Entregable |
|---|---|---|---|
| A-01 | Validar reglas RN-01…RN-13 contra el esquema real | ✅ | Diagnóstico de BD (funciones, triggers, constraints) |
| A-02 | Detectar brechas de seguridad en el esquema original (rol desde `raw_user_meta_data`, `UPDATE` libre de `lista_compras`, `INSERT` libre de movimientos) | ✅ | Informe y migración 0002 |
| A-03 | Confirmar Expo Router como requisito (ADR-01) | ✅ | Requisito del proyecto |
| A-04 | Refinar historias de usuario con criterios de aceptación (HU-01…HU-05 y las de administración) | ⬜ | Backlog priorizado |
| A-05 | Definir catálogo de mensajes de error por código SQL (`23514`, `42501`, `22023`, `P0002`, `23505`) | 🔄 | `traducirError()` |
| A-06 | Validar el flujo de «primer usuario = administrador» y el procedimiento de promoción | ⬜ | Procedimiento operativo |
| A-07 | Definir qué ocurre con un insumo creado con stock 0 (el trigger solo corre en `UPDATE`) | ⬜ | Decisión: movimiento inicial o trigger `AFTER INSERT` |
| A-08 | Definir el alcance de Reportes (qué métricas, qué rangos) | ⬜ | Especificación de pantalla |
