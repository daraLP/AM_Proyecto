# Fase 1 · Análisis: Tareas

> **POSCafé · Specs · Fase 1 · Análisis** · Índice general: [`../README.md`](../README.md)
> Estado reconstruido contra el código. Leyenda: ✅ hecho y verificable · 🔄 parcial / sin verificación suficiente · ⬜ no encontrado · 🆕 tarea nueva derivada del código.

| ID | Tarea | Estado | Evidencia / entregable |
|---|---|---|---|
| A-01 | Validar reglas RN-01…RN-13 contra el esquema real | ✅ | [`requerimientos.md`](requerimientos.md) (mecanismo por regla) y pgTAP `rls_y_stock.test.sql` |
| A-02 | Detectar brechas de seguridad del esquema original (rol desde `raw_user_meta_data`, `UPDATE` libre de `lista_compras`, `INSERT` libre de movimientos) | ✅ | Corregidas en `20261010000000_endurecimiento_poscafe.sql` (comentario «CORRECCIÓN DE SEGURIDAD»); pgTAP #1, #13 |
| A-03 | Confirmar Expo Router como requisito (ADR-01) | ✅ | `package.json` `main: expo-router/entry`; [`adr.md`](../00-contexto/adr.md) |
| A-04 | Refinar historias de usuario con criterios de aceptación | ✅ | [`diseno/02-historias-de-usuario.md`](diseno/02-historias-de-usuario.md) (HU-01…HU-14, CA-01…CA-30) |
| A-05 | Catálogo de mensajes de error por código SQL (`23514`, `42501`, `22023`, `P0002`, `23505`, …) | ✅ | `src/utils/errores.ts` (`MENSAJES`, `clasificar`); `__tests__/errores.test.ts` |
| A-06 | Definir el procedimiento de «primer usuario = administrador» y de promoción | 🔄 | Lógica en `manejar_nuevo_usuario`; promoción por `UsuariosScreen`; **sin procedimiento operativo escrito** (qué hacer si el primer registro no es el dueño o si se pierde el admin: H-07) |
| A-07 | Definir qué ocurre con un insumo creado con stock 0 | 🔄 | Decisión de facto: stock inicial por movimiento (`crearInsumo`); **sin** trigger `AFTER INSERT` (H-02) |
| A-08 | Definir el alcance de Reportes (métricas y rangos) | ✅ | Rangos 7 d / 30 d / mes / 90 d; métricas consumido y merma por insumo (RF-14, CU-08) |
| A-09 🆕 | Documentar la evolución de RN-10 (ADR-08) y su impacto en RLS/UI | ✅ | [`adr.md`](../00-contexto/adr.md#detalle-de-adr-08-evolución-de-la-regla-rn-10) |
| A-10 🆕 | Definir límites de entrada (RN-14) | ✅ | `LIMITES`, migración `20261122000000`, `limites_de_entrada.test.sql` |
| A-11 🆕 | Decidir el alcance offline (solo movimientos) | ✅ | ADR-10, RN-20 |
| A-12 🆕 | Definir el contenido de «Actividad del equipo» | ✅ | RF-18, CU-07 |
| A-13 🆕 | Decidir si se implementa recuperación de contraseña (RF-03) | ⬜ | H-11 |
| A-14 🆕 | Decidir el alcance del historial completo (RF-08 / H-10) | ⬜ | Pantalla paginada de historial por insumo o global |
| A-15 🆕 | Documentar el procedimiento de configuración del Database Webhook y secretos (H-06) | ⬜ | `WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
