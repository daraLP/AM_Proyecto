# Fase 2 · Diseño: Tareas

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: [`../README.md`](../README.md)
> Leyenda: ✅ hecho y verificable · 🔄 parcial · ⬜ no encontrado · 🆕 derivada del código.

| ID | Tarea | Estado | Evidencia / entregable |
|---|---|---|---|
| D-01 | Modelo de datos y esquema SQL base (8 tablas, columna generada, índices) | ✅ | Migración `0001`; [modelo de datos](diseno/01-modelo-de-datos-resumen-del-estado-final.md) |
| D-02 | Funciones, triggers y RPC (`registrar_movimiento`, `comprar_item`, etc.) | ✅ | Migración `0002`; [funciones y triggers](diseno/02-funciones-y-triggers-migracion-0002.md) |
| D-03 | Políticas RLS por rol y endurecimiento | ✅ | Migraciones `0002`/`0003`; [seguridad](diseno/03-seguridad-rls-resumen.md) |
| D-04 | Arquitectura frontend por capas (rutas, features, hooks, servicios) | ✅ | [arquitectura frontend](diseno/04-arquitectura-frontend.md) |
| D-05 | Contratos de servicios y RPC | ✅ | [contratos de API](diseno/05-contratos-de-api.md) |
| D-06 | Navegación con Expo Router y guardas | ✅ | [navegación](diseno/06-navegacion-con-expo-router-y-guardas-por-rol.md) |
| D-07 | Wireframes de estructura | 🔄 | [wireframes](diseno/07-wireframes-estructura.md); inferidos del código, no hay maquetas originales |
| D-08 | Política de caché y modo sin conexión | ✅ | `queryClient.ts`, `netinfo.ts`; ADR-10 |
| D-09 | Sistema de feedback sin `Alert.alert` | ✅ | `FeedbackProvider` |
| D-10 🆕 | Migración de endurecimiento de límites de entrada | ✅ | `20261122000000_limites_de_entrada.sql` |
| D-11 🆕 | Permitir a baristas crear/editar insumos (ADR-08) | ✅ | `20261015000000_baristas_editan_insumos.sql` |
| D-12 🆕 | Repetir la búsqueda por `client_op_id` tras `FOR UPDATE` (mejora propuesta en documentos antiguos) | ⬜ | Compensada por el reintento del cliente; H-04 |
| D-13 🆕 | Trigger `AFTER INSERT` para insumos nacidos bajo el mínimo | ⬜ | H-02 |
| D-14 🆕 | Parametrizar zona horaria y radio de proximidad | ⬜ | H-08, H-09 |
| D-15 🆕 | Corregir etiqueta del gráfico semanal | ⬜ | H-01 |
| D-16 🆕 | Versionar la configuración del Database Webhook y de la Edge Function | ⬜ | H-06 |
