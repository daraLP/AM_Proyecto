# Fase 3 · Desarrollo: Requerimientos

> **POSCafé · Specs · Fase 3 · Desarrollo** · Índice general: `docs/specs/README.md`


| ID | Requerimiento |
|---|---|
| RDV-01 | VSCode con ESLint, Prettier y TypeScript en modo `strict`; sin `any` en servicios y hooks. |
| RDV-02 | Variables `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` en `.env` (fuera de Git). La `service_role` **nunca** en la app. |
| RDV-03 | Mapas y push requieren *development build* (no Expo Go). |
| RDV-04 | Rendimiento: `FlatList` con `keyExtractor`, `React.memo` en filas, paginación de 20 ítems, búsqueda con *debounce* de 300 ms. |
| RDV-05 | Offline: caché persistida (AsyncStorage) y mutaciones pausadas con `client_op_id`. |
| RDV-06 | Cada pantalla maneja estados *cargando / vacío / error / sin permisos*. |
