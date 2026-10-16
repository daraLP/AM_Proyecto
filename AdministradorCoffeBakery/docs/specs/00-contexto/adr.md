# Decisiones de arquitectura (ADR)

> **POSCafé · Specs · Contexto** · Índice general: `docs/specs/README.md`


| ID | Decisión | Estado |
|---|---|---|
| **ADR-01** | **Expo Router** como navegación (requisito del proyecto). Rutas en **`src/app`** (Expo Router lo soporta y mantiene todo el código bajo `src/`). | ✅ Resuelta |
| **ADR-02** | **TanStack Query con persistencia offline** (AsyncStorage) para estado del servidor; **Zustand** para estado de cliente. | ✅ Resuelta |
| **ADR-03** | Cliente Supabase único en `src/lib/supabaseClient.ts`. | ✅ Resuelta |
| **ADR-04** | Motivos como texto en español con CHECK; constante única `MOTIVOS`. | ✅ Resuelta |
| **ADR-05** | Tipos generados en `src/types/database.types.ts`, **UTF-8**. Los tipos de dominio (`Insumo`, `Perfil`, `MOTIVOS`…) viven en `src/types/database.ts` y derivan de los generados. | ⬜ Por aplicar |
| **ADR-06** | Los parámetros de Expo Router son *strings*: no se pasan objetos (`insumo`) entre pantallas; se pasa el `id` y se consulta (con caché). | ⬜ Por aplicar |
| **ADR-07** | La autorización por rol se aplica en **tres capas**: layouts con redirección (UX), RLS y RPC `SECURITY DEFINER` (seguridad real). | ✅ Resuelta |
| **ADR-08** | Los baristas pueden **crear y editar insumos** (RN-10 modificada). El stock y la desactivación siguen restringidos (stock solo por RPC; desactivar solo administrador). | ✅ Resuelta |

**Nota de nomenclatura:** los hooks se nombran en español para ser consistentes con el esquema (`useInsumos` ≙ `useSupplies`, `useRegistrarMovimiento` ≙ `useRegisterMovement`).
