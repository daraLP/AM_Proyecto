# Fase 2 · Diseño: Tareas

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: `docs/specs/README.md`


| ID | Tarea | Estado | Entregable |
|---|---|---|---|
| D-01 | Documentar el SDD v1.1 con el esquema real | ✅ | SDD v1.1 |
| D-02 | Escribir y ejecutar la migración 0002 | ✅ | `0002_endurecimiento_poscafe.sql` |
| D-03 | Prueba SQL de punta a punta con rollback | 🔄 | Script DO entregado |
| D-04 | Generar tipos con `supabase gen types typescript --linked` (UTF-8) en `src/types/database.types.ts` y conectar `createClient<Database>` | 🔄 | Tipos ya generados post-0002; corregir codificación y ubicación (ADR-05) |
| D-05 | Definir tipos de dominio (`Insumo`, `Perfil`, `MovimientoInventario`, `MOTIVOS`) | 🔄 | `types/database.ts` |
| D-06 | ~~Resolver ADR-01~~ Expo Router adoptado; cliente único ya confirmado (ADR-03) | ✅ | ADR-01 y ADR-03 resueltos |
| D-07 | Diseñar la migración 0003: idempotencia tras bloqueo; opcional trigger `AFTER INSERT` | ⬜ | `0003_*.sql` |
| D-08 | Diseñar wireframes de detalle, modal, compras y dashboard | ⬜ | Figma / bocetos |
| D-09 | Definir catálogo de componentes y tema (colores de estado ok/bajo/agotado) | ⬜ | Guía de UI |
| D-10 | Definir `queryClient` (staleTime, persistencia, política offline) | ⬜ | Especificación |
| D-11 | Revisar índices con `EXPLAIN` en la consulta de inventario y en el historial | ⬜ | Informe |
| D-12 | Configurar Expo Router: instalar dependencias, `main: expo-router/entry`, `scheme`, plugin, `typedRoutes` y alias `@/*` | 🔄 | `npx expo start` arranca con rutas |
| D-13 | Crear el árbol `src/app` con layouts y rutas delgadas (re-export de features) | 🔄 | Mapa de rutas de §2.2 completo |
| D-14 | Implementar guardas: `(auth)`, `(app)`, `SoloAdmin` y pantalla `ErrorPerfil` | 🔄 | Sin sesión → login; barista en ruta admin → dashboard |
| D-15 | Migrar pantallas existentes a `useRouter`/`useLocalSearchParams` (ADR-06); eliminar `App.tsx`, `index.ts` clásico y `src/navigation/*` | 🔄 | Sin imports de `@react-navigation` para navegar |
| D-16 | Consolidar tipos: mover `/types/supabase.ts` a `src/types/` (UTF-8), derivar `database.ts` de los generados y eliminar el duplicado | ⬜ | `tsc --noEmit` sin errores |
| D-17 | Versionar la base en el repo: `supabase/migrations/<timestamp>_0002_endurecimiento.sql`, `supabase db pull` para la 0001; crear `supabase/functions` y `supabase/tests` | ⬜ | `supabase db reset` reproduce el esquema |
| D-18 | Higiene del repo: `.gitignore` con `.env`, `.expo/` y `supabase/.temp/`; `.env.example` completo (URL y anon key) | ⬜ | Sin secretos ni temporales versionados |
| D-19 | Guardar `Specs_POSCafe.md` y ADR en `docs/` | ⬜ | Documentación versionada |
