# Contexto del proyecto

> **POSCafé · Specs · Contexto** · Índice general: [`README.md`](README.md)
> Resumen de la sección 00. El detalle está en [`00-contexto/`](00-contexto/estado-actual.md).

## 1. Propósito y alcance

POSCafé reemplaza el control manual de inventario de una cafetería: registra movimientos de insumos con un contador rápido, mantiene el stock siempre consistente en la base de datos, genera una lista de compras cuando el stock baja del mínimo, avisa por push, ubica proveedores en un mapa y ofrece un dashboard operativo.

## 2. Actores

| Actor | Descripción |
|---|---|
| **Administrador** | Gestiona insumos (incluida la baja lógica), proveedores, categorías, usuarios y reportes; también opera el inventario |
| **Barista** | Registra movimientos, crea y edita insumos (stock inicial 0), agrega ítems manuales y marca compras |
| **Sistema** | Triggers de BD, Realtime, Database Webhook y Edge Function de push |

## 3. Principios arquitectónicos

1. **La BD es la autoridad** del stock; la UI proyecta y revierte.
2. **Autorización en tres capas:** layouts (UX), RLS y RPC/triggers.
3. **Idempotencia** con `client_op_id`; **offline** solo para movimientos.
4. **Errores y feedback centralizados** (`mensajeDeError`, `useToast`, `useDialogo`).
5. **Validación en dos capas** (`LIMITES` + restricciones SQL).

## 4. Resumen de ADR

| ADR | Decisión | Estado |
|---|---|---|
| ADR-01 | Expo Router como navegación | ✅ aplicada |
| ADR-02 | TanStack Query persistido + Zustand | ✅ aplicada |
| ADR-03 | Cliente Supabase único | ✅ aplicada |
| ADR-04 | Motivos en español con `CHECK`; constante `MOTIVOS` | ✅ aplicada |
| ADR-05 | Tipos generados en `database.types.ts` + tipos de dominio | ✅ aplicada (antes pendiente) |
| ADR-06 | Parámetros de ruta como `string`: se pasa el `id` | ✅ aplicada (antes pendiente) |
| ADR-07 | Autorización en tres capas | ✅ aplicada |
| ADR-08 | Baristas crean y editan insumos (evolución de RN-10) | ✅ aplicada |
| ADR-09…20 | Derivadas del código (BD autoridad, cola offline solo de movimientos, `client_op_id`, feedback propio, errores centralizados, anti-doble toque, límites en dos capas, Haversine, push por webhook, Realtime para invalidar, bucket público, acceso a datos mixto) | ✅ ver [`adr.md`](00-contexto/adr.md) |
| ADR-A1…A4 | Abiertas (insumo nacido agotado, idempotencia concurrente, último administrador, webhook/secretos) | ⬜ |

## 5. Estado

Ver [`estado-actual.md`](00-contexto/estado-actual.md): inventario del repositorio, migraciones, módulos y **19 hallazgos** (H-01…H-19). Los más relevantes: H-01 (etiquetas del gráfico), H-02 (insumos nacidos bajo el mínimo), H-04 (carrera de idempotencia compensada por el cliente), H-06 (webhook/secretos no versionados), H-14 y H-19 (brechas de pruebas).

## 6. Convenciones

Prefijos de ID (RN, RF, RNF, CU, HU, CA, ADR, H, RD, RDV, QA…), nomenclatura en español para dominio y servicios, estilos de retorno de servicios y estados ✅🔄⬜⛔ en [`convenciones.md`](00-contexto/convenciones.md).
