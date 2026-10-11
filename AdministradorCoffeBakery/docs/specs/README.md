# POSCafé: Especificaciones técnicas (índice)

Especificaciones derivadas del SDD v1.1 (`docs/SDD_POSCafé.md`), divididas por fase y por tema para que una persona o un agente de IA cargue **solo el contexto que necesita**.

> Si eres un agente: lee primero `AGENTS.md` (raíz del repo), luego este índice y después solo los archivos del mapa de contexto de tu tarea.

## Estructura

```
docs/
├─ SDD_POSCafé.md                      # Diseño completo (fuente de verdad conceptual)
└─ specs/
   ├─ README.md                        # Este índice
   ├─ 00-contexto/                     # Convenciones, estado actual, decisiones (ADR)
   ├─ 01-analisis/
   │  ├─ requerimientos.md             # Reglas de negocio RN, RF, RNF
   │  ├─ diseno/                       # Casos de uso, historias, matriz de trazabilidad
   │  └─ tareas.md                     # A-xx
   ├─ 02-diseno/
   │  ├─ requerimientos.md             # RD-xx
   │  ├─ diseno/                       # BD, funciones/triggers, RLS, frontend, API, navegación, wireframes
   │  └─ tareas.md                     # D-xx
   ├─ 03-desarrollo/
   │  ├─ requerimientos.md             # RDV-xx
   │  ├─ diseno/                       # QuickCounter, inventario, compras+mapa, push, dashboard
   │  └─ tareas.md                     # DEV-xx
   ├─ 04-pruebas/
   │  ├─ requerimientos.md             # Criterios de aceptación CA-xx
   │  ├─ diseno/                       # Jest, guardas, pgTAP, concurrencia, CI
   │  └─ tareas.md                     # QA-xx
   └─ 05-guia/
      ├─ GUIA_IMPLEMENTACION.md        # Paso a paso con hitos y prompts para el agente
      └─ ruta-de-ejecucion.md          # Dependencias entre tareas

supabase/
├─ migrations/20261010000000_endurecimiento_poscafe.sql   # Migración 0002 (ya aplicada en el proyecto)
└─ tests/{database/rls_y_stock.test.sql, concurrencia.pgbench.sql}
.github/workflows/ci.yml
```

## Estados y prioridades

⬜ pendiente · 🔄 existe/entregado, por validar · ✅ hecho. Prioridad MoSCoW: **M** debe, **S** debería, **C** podría.
Para cambiar el estado de una tarea, edita su fila en el `tareas.md` de su fase.

## Mapa de contexto por tarea (qué leer antes de implementar)

| Trabajo | Lee |
|---|---|
| Cualquier tarea | `AGENTS.md`, `00-contexto/convenciones.md`, `00-contexto/adr.md` |
| Migrar a Expo Router (D-12…D-15) | `02-diseno/diseno/06-navegacion-con-expo-router-y-guardas-por-rol.md`, `02-diseno/diseno/04-arquitectura-frontend.md` |
| Tipos, repo y base (D-04, D-16…D-19) | `00-contexto/estado-actual.md`, `02-diseno/diseno/01-modelo-de-datos-resumen-del-estado-final.md` |
| Auth, sesión y providers (DEV-01/02/04/29/30) | `01-analisis/requerimientos.md` (RN-09), `02-diseno/diseno/04-arquitectura-frontend.md`, `02-diseno/diseno/05-contratos-de-api.md` |
| Contador rápido (DEV-05…08) | `03-desarrollo/diseno/01-quickcounter-stepper-chips.md`, `01-analisis/diseno/01-casos-de-uso-principales.md` (CU-01), `02-diseno/diseno/02-funciones-y-triggers-migracion-0002.md`, `02-diseno/diseno/05-contratos-de-api.md` |
| Inventario y CRUD de insumos (DEV-11/12/14) | `03-desarrollo/diseno/02-pantalla-de-inventario-lista-paginada-y-filtros.md`, `02-diseno/diseno/03-seguridad-rls-resumen.md` |
| Lista de compras (DEV-15/16/31) | `03-desarrollo/diseno/03-lista-de-compras-y-mapa-de-proveedores.md`, CU-03 |
| Mapa de proveedores (DEV-17/18) | `03-desarrollo/diseno/03-lista-de-compras-y-mapa-de-proveedores.md`, CU-04 |
| Push (DEV-19…21) | `03-desarrollo/diseno/04-notificaciones-push.md`, CU-02 |
| Dashboard, reportes, perfil, usuarios (DEV-09/10/22…25/32) | `03-desarrollo/diseno/05-dashboard.md`, `02-diseno/diseno/03-seguridad-rls-resumen.md` |
| Pruebas (QA-xx) | `04-pruebas/requerimientos.md` y el archivo de `04-pruebas/diseno/` que corresponda |
| Build y entrega (DEV-26/27) | `03-desarrollo/requerimientos.md`, `03-desarrollo/tareas.md` |
