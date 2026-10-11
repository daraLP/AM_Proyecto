# Estado actual del proyecto

> **POSCafé · Specs · Contexto** · Índice general: `docs/specs/README.md`


| Elemento | Estado | Observación |
|---|---|---|
| Base de datos: esquema 0001 + migración `0002` | ✅ | Ejecutada y verificada (8 funciones, 5 triggers, 16 políticas RLS) |
| Tipos generados (`/types/supabase.ts`) | 🔄 | Ya incluyen lo posterior a 0002 (`registrar_movimiento`, `comprar_item`, `estado_stock`, `push_tokens`). **Problemas:** el archivo está en **UTF-16** (lo generó PowerShell con `>`) y vive fuera de `src/`, duplicando `src/types/database.types.ts` |
| Cliente Supabase (`src/lib/supabaseClient.ts`) | ✅ | Un solo cliente (sin duplicado) |
| Navegación | 🔄 | `App.tsx` + `index.ts` clásicos y `src/navigation/*` (React Navigation). **Se migra a Expo Router** |
| Features existentes | 🔄 | `auth` (Login, Register, Perfil, authStore), `dashboard` (Dashboard, Reports), `insumos` (Form, List), `listaCompras` (Screen). Su contenido debe validarse contra las RPC y los roles |
| Servicios / hooks / utils | 🔄 | `services/{dashboard,insumos,movimientos}.ts`, `hooks/useDashboard.ts`, `utils/uuid.ts` |
| Migraciones en el repo | ⬜ | Solo existe `supabase/.temp`; falta `migrations/`, `functions/` y `tests/` (la 0002 no está versionada) |
| Faltan por crear | ⬜ | `src/app/`, `components/`, `store/`, `providers/`, `lib/queryClient.ts`, servicios de compras/proveedores/perfiles |
