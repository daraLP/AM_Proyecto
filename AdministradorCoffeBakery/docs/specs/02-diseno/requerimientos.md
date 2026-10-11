# Fase 2 · Diseño: Requerimientos

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: `docs/specs/README.md`


| ID | Requerimiento de diseño |
|---|---|
| RD-01 | Navegación con **Expo Router** (rutas en `src/app`): 4 tabs (Dashboard, Inventario, Compras, Perfil), stacks por tab y modales para movimiento, escaneo/foto y confirmación de compra; layouts que redirigen según sesión y rol. |
| RD-02 | La base es la autoridad de las reglas de negocio (RPC `SECURITY DEFINER`, triggers, RLS); la app nunca calcula stock. |
| RD-03 | Capa de servicios única que encapsula Supabase; hooks de datos sobre ella; componentes sin lógica de acceso a datos. |
| RD-04 | Tipos de BD generados y un único cliente Supabase con sesión persistente. |
| RD-05 | Contratos de API explícitos con errores traducibles. |
| RD-06 | Almacenamiento de fotos en bucket `fotos-insumos` con escritura solo para administradores. |
