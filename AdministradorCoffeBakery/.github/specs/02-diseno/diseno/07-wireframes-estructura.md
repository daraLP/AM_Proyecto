# Fase 2 · Diseño: Wireframes (estructura)

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: [`../../README.md`](../../README.md)
> Esquemas de estructura de las pantallas **implementadas**, derivados de los componentes. Son ASCII de baja fidelidad; la apariencia final está definida por `theme.ts`.

## 1. Convenciones

`[ ]` botón · `( )` campo · `▢` checkbox · `●/○` radio/chip · `⛔` oculto o inactivo para barista · `🔒` solo administrador.

## 2. Login / Registro

```
┌──────────────────────────┐
│        POSCafé           │
│  (Correo)                │
│  (Contraseña)            │
│  [ Iniciar sesión ]      │
│  ¿No tienes cuenta?      │
│  [ Crear cuenta ]        │
└──────────────────────────┘
Registro: (Nombre) (Correo) (Contraseña) [ Crear cuenta ] [ Volver a login ]
Si confirmarCorreo → aviso «revisa tu correo».
```

Validación `zod` con `LIMITES` (correo 254, contraseña 6–72, nombre 60).

## 3. Dashboard (`/dashboard`)

```
┌────────────────────────────────┐
│ Dashboard                      │
│ Resumen operativo              │
│ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │  42  │ │  5   │ │  2   │     │
│ │Total │ │Bajo  │ │Agota-│     │
│ └──────┘ └──────┘ │dos   │     │
│                   └──────┘     │
│ ⚠ Alertas críticas [Ver compras]│
│ Consumo semanal · últimos 7 días│
│ ▁ ▃ ▆ ▂ ▅ ▇ ▄  (BarChart)      │
│ [ Ver actividad del equipo › ] │
│ [ Ver reporte detallado › ] 🔒 │
└────────────────────────────────┘
```

Consultas con `refetchInterval` 60 s y refresco al enfocar; la tarjeta de alertas (solo si `bajo > 0` o `agotado > 0`) enlaza a `/compras`. Estados de carga/error/vacío con `PantallaCarga`/`ErrorState`.

## 4. Inventario (`/inventario`)

```
┌────────────────────────────────┐
│ Inventario              [ + ]  │
│ (🔍 Buscar insumo)             │
│ ● Todas ○ Lácteos ○ Café …     │
│ ● Todos ○ Bajo ○ Agotado       │
│ ┌────────────────────────────┐ │
│ │ [foto] Leche entera [BAJO] │ │
│ │ Stock: 3 L (Mín: 5)        │ │
│ └────────────────────────────┘ │
│ … (scroll infinito, 20/página) │
└────────────────────────────────┘
```

Detalle técnico en [03-desarrollo/02](../../03-desarrollo/diseno/02-pantalla-de-inventario-lista-paginada-y-filtros.md).

## 5. Detalle de insumo (`/inventario/[insumoId]`)

```
┌────────────────────────────────┐
│ ‹ Inventario   Insumo          │
│ [foto]  Leche entera  [OK]     │
│ Stock actual: 8 L · Mín 5      │
│ Categoría · Proveedor          │
│ ── Registrar movimiento ──     │
│ Registrar:  [ −1 ] ( 0 ) [ +1 ]
│ Chips: [ +1 ] [ +5 ] [ +10 ]  (configurables)
│ [ Editar ] [ Foto ]            │
│ [ Desactivar ] 🔒 (⛔ barista) │
│ ── Últimos movimientos ──      │
│ −2 L · Uso en preparación · Ana│
└────────────────────────────────┘
```

Los controles del contador navegan a `/movimiento-modal` con `delta` (cadena en `params`). En los chips, tocar suma y mantener pulsado resta.

## 6. Modal de movimiento (`/movimiento-modal`)

```
┌────────────────────────────────┐
│ Leche entera                   │
│     [ − ]  ( −2 )  [ + ]       │
│ Chips: [ +1 ] [ +5 ] [ +10 ]   │
│ (tocar suma · mantener resta)  │
│ Quedará: 6 L                   │
│ Motivo:                        │
│ ● Uso en preparación ○ Compra  │
│ ○ Merma/Vencido ○ Ajuste …     │
│ (Nota opcional · ≤200)         │
│ [ Confirmar ]   [ Cancelar ]   │
└────────────────────────────────┘
```

Primero se valida; si la cola está pausada (sin red) se encola, se avisa por toast y se cierra el modal. El `client_op_id` se genera al montar.

## 7. Formulario de insumo (`/inventario/form`)

```
(Nombre) (Unidad ▾) (Categoría ▾) (Proveedor ▾)
(Stock mínimo)
(Stock inicial)   ← solo en alta; barista: fijo en 0 ⛔
[ Guardar ]
```

En edición no existe campo de stock (el stock solo cambia por movimiento).

## 8. Lista de compras (`/compras`)

```
┌────────────────────────────────┐
│ Compras                        │
│ ▢ Leche entera   6 L   [AUTO]  │
│    Proveedor X ›               │
│ ▢ Azúcar         2 kg  [MANUAL]│
│ [ + Agregar manual ]           │
│ [ Proveedores cercanos (mapa) ]│
└────────────────────────────────┘
```

Marcar un ítem abre `/confirmar-compra-modal`.

## 9. Confirmar compra

```
┌────────────────────────────────┐
│ Leche entera                   │
│ Sugerido: 6 L                  │
│ (Cantidad comprada)            │
│ [ Confirmar compra ] [ Cancelar]│
└────────────────────────────────┘
```

## 10. Proveedor y mapa

```
Mapa (SupplierMap): marcadores por proveedor, posición del usuario
Ficha: (Nombre)(Teléfono)(Dirección + pin SelectorUbicacion)
       Insumos asociados ▢ …   [ Guardar ] 🔒   [ Eliminar ] 🔒
```

## 11. Perfil

```
Nombre: (………)  [ Guardar ]
Rol: barista
Incrementos rápidos: (1)(5)(10)  [ Restablecer ]
[ Gestionar usuarios y roles ] 🔒
[ Categorías ] 🔒
[ Cerrar sesión ]
```

## 12. Otros

| Pantalla | Estructura |
|---|---|
| `UsuariosScreen` 🔒 | Lista de perfiles con selector de rol |
| `CategoriasScreen` 🔒 | Lista + campo de alta + renombrar/eliminar |
| `ActividadScreen` | Lista de movimientos del equipo (insumo, delta, motivo, autor, fecha) |
| `DashboardReportsScreen` 🔒 | Selector de rango + tabla consumido/merma por insumo |
| `FotoInsumoScreen` | Vista previa + [Tomar foto] [Elegir de galería] [Guardar] |
| Banner offline | Pastilla inferior «Sin conexión · tus cambios se enviarán al reconectar» |
| Toast / Diálogo | Ver [arquitectura frontend §6](04-arquitectura-frontend.md#6-sistema-de-feedback-feedbackprovider) |

> Los esquemas de las secciones 3–12 son representaciones de estructura inferidas del código de cada pantalla; la disposición exacta debe verificarse en dispositivo.
