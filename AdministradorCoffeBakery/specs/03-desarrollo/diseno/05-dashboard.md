# Fase 3 · Desarrollo: Dashboard

> **POSCafé · Specs · Fase 3 · Desarrollo** · Índice general: [`../../README.md`](../../README.md)
> Código: `src/features/dashboard/{DashboardScreen,ActividadScreen,DashboardReportsScreen}.tsx`, `src/hooks/useDashboard.ts`, `src/hooks/useActividad.ts`, `src/services/dashboard.ts`, `src/utils/actividad.ts`.

## 1. Pantalla principal (`/dashboard`)

| Bloque | Fuente | Detalle |
|---|---|---|
| Tarjetas «Total Insumos», «Stock Bajo», «Agotados» | RPC `resumen_dashboard` | Contadores de insumos **activos** |
| Alertas críticas | `bajo > 0` o `agotado > 0` | Tarjeta con botón «Ver compras» → `/compras` |
| Consumo semanal | RPC `consumo_semanal(p_dias = 7)` | `BarChart` (`react-native-gifted-charts`); etiqueta `dia.slice(0, 3)`; si todas las salidas son 0, texto «Aún no hay salidas registradas en los últimos 7 días.» |
| Actividad del equipo | — | Botón → `/dashboard/actividad` |
| Reporte detallado | — | Botón visible solo si `useEsAdmin()` → `/dashboard/reports` |

### 1.1 Actualización de datos

| Mecanismo | Valor |
|---|---|
| `refetchInterval` | 60 s en `["dashboard","resumen"]` y `["dashboard","consumo"]` |
| `useFocusEffect` | Invalida `["dashboard"]` al enfocar |
| *Pull to refresh* | `refrescar()` = refetch de ambas |
| Invalidación | Tras movimiento, compra, formulario de insumo, desactivación; Realtime `insumos` |
| Error | Pantalla con «No se pudo cargar el Dashboard» y *Reintentar* |

### 1.2 Semántica del «consumo semanal»

La función cuenta **movimientos** de tipo `salida` con motivo `Uso en preparación` o `Merma/Vencido` por día (no suma cantidades, porque las unidades difieren). Los días sin salidas aparecen con 0 (`generate_series`). La zona horaria por defecto es `America/Mexico_City` (H-08).

> **Defecto H-01:** `dia` llega como `date` (`YYYY-MM-DD`) y la etiqueta usa `slice(0, 3)`, por lo que cada barra se rotula con los tres primeros dígitos del año. Verificar en dispositivo; la corrección sería formatear el día (p. ej. abreviatura de día de la semana).

## 2. Validación defensiva de respuestas

`services/dashboard.ts` valida la forma de cada respuesta (`numeroValido`, tipos de `dia`) y ante datos inesperados registra `console.warn("[dashboard] …")` y lanza `ErrorUsuario` con un mensaje genérico (sin exponer detalles técnicos).

## 3. Actividad del equipo (`ActividadScreen`)

`useActividad(limite = 50)` → `["actividad", limite]` → `listarActividad`. Cada fila usa `describirMovimiento(m)` (`quien`, `accion`: «<verbo> <cantidad><unidad> <a|de> <insumo>») y `tiempoRelativo` («ahora mismo», «hace 5 min», «hace 3 h», «ayer», fecha corta). Se actualiza por Realtime sobre `movimientos_inventario`.

## 4. Reportes (`DashboardReportsScreen`, solo administrador)

| Aspecto | Detalle |
|---|---|
| Acceso | `SoloAdmin` en la ruta + `42501` de la RPC |
| Rangos | 7 días, 30 días, mes y 90 días (RF-14) |
| Consulta | `consumo_por_insumo(p_desde, p_hasta)` con fechas ISO; clave `["dashboard","reporte",desde,hasta]` |
| Datos | Por insumo: `consumido` (motivo `Uso en preparación`) y `merma` (`Merma/Vencido`), ordenado por consumo descendente |
| Intervalo | Semiabierto `[desde, hasta)` |

## 5. Pruebas

| Elemento | Prueba |
|---|---|
| `describirMovimiento`, `tiempoRelativo` | `__tests__/actividad.test.ts` |
| Permiso de `consumo_por_insumo` | pgTAP `rls_y_stock.test.sql` |
| Pantallas de Dashboard, hooks y validadores de servicio | Sin pruebas automatizadas |
