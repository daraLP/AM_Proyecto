# Fase 2 · Diseño: Navegación con Expo Router y guardas por rol

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: [`../../README.md`](../../README.md)
> Esquema de deep link: `poscafe`. `typedRoutes` activo (tipos en `.expo/types/router`). Los archivos de ruta son delgados: re-exportan pantallas de `src/features`.

## 1. Árbol de navegación

```mermaid
flowchart TD
  ROOT["_layout (Slot + AppProviders + inicializar sesión)"]
  IDX["index → Redirect /dashboard o /login"]
  AUTH["(auth)/_layout<br/>con sesión → Redirect /dashboard"]
  LOGIN["login"]
  REG["register"]
  APP["(app)/_layout<br/>cargando → PantallaCarga<br/>sin sesión → Redirect /login<br/>sin perfil → ErrorPerfil<br/>Stack + banner offline + push + realtime"]
  TABS["(tabs)/_layout · Tabs"]
  MOV["movimiento-modal (modal)"]
  SCAN["scan-modal (modal · foto)"]
  CONF["confirmar-compra-modal (modal)"]
  DASH["dashboard/ · Stack"]
  INV["inventario/ · Stack"]
  COM["compras/ · Stack"]
  PER["perfil/ · Stack"]
  D1["index"]
  D2["reports 🔒 SoloAdmin"]
  D3["actividad"]
  I1["index"]
  I2["[insumoId]"]
  I3["form (?id)"]
  C1["index"]
  C2["proveedor/[proveedorId] ('nuevo' = alta)"]
  P1["index"]
  P2["usuarios 🔒 SoloAdmin"]
  P3["categorias 🔒 SoloAdmin"]
  ROOT --> IDX
  ROOT --> AUTH --> LOGIN & REG
  ROOT --> APP
  APP --> TABS & MOV & SCAN & CONF
  TABS --> DASH & INV & COM & PER
  DASH --> D1 & D2 & D3
  INV --> I1 & I2 & I3
  COM --> C1 & C2
  PER --> P1 & P2 & P3
```

## 2. Tabla de rutas

| URL | Archivo (bajo `src/app`) | Pantalla | Parámetros | Acceso |
|---|---|---|---|---|
| `/` | `index.tsx` | Redirección según sesión | — | Todos |
| `/login` | `(auth)/login.tsx` | `LoginScreen` | — | Sin sesión |
| `/register` | `(auth)/register.tsx` | `RegisterScreen` | — | Sin sesión |
| `/dashboard` | `(app)/(tabs)/dashboard/index.tsx` | `DashboardScreen` | — | Autenticado |
| `/dashboard/reports` | `…/dashboard/reports.tsx` | `DashboardReportsScreen` | — | **Administrador** |
| `/dashboard/actividad` | `…/dashboard/actividad.tsx` | `ActividadScreen` | — | Autenticado |
| `/inventario` | `…/inventario/index.tsx` | `InventarioListScreen` | — | Autenticado |
| `/inventario/[insumoId]` | `…/inventario/[insumoId].tsx` | `InsumoDetalleScreen` | `insumoId` | Autenticado |
| `/inventario/form` | `…/inventario/form.tsx` | `InsumoFormScreen` | `id?` (edición) | Autenticado (acciones por rol) |
| `/compras` | `…/compras/index.tsx` | `ListaComprasScreen` | — | Autenticado |
| `/compras/proveedor/[proveedorId]` | `…/compras/proveedor/[proveedorId].tsx` | `ProveedorDetalleScreen` | `proveedorId` o `nuevo` | Lectura: todos; alta/edición: administrador |
| `/perfil` | `…/perfil/index.tsx` | `PerfilScreen` | — | Autenticado |
| `/perfil/usuarios` | `…/perfil/usuarios.tsx` | `UsuariosScreen` | — | **Administrador** |
| `/perfil/categorias` | `…/perfil/categorias.tsx` | `CategoriasScreen` | — | **Administrador** |
| `/movimiento-modal` | `(app)/movimiento-modal.tsx` | `MovimientoModalScreen` | `insumoId`, `delta?` | Autenticado |
| `/scan-modal` | `(app)/scan-modal.tsx` | `FotoInsumoScreen` | `insumoId` | Autenticado |
| `/confirmar-compra-modal` | `(app)/confirmar-compra-modal.tsx` | `ConfirmarCompraScreen` | `itemId` | Autenticado |

> **Nota de nomenclatura:** `scan-modal` conserva el nombre histórico del plan original (escaneo), pero su pantalla es `FotoInsumoScreen` (tomar o elegir la foto del insumo y subirla a `fotos-insumos`). No hay escáner de códigos.

## 3. Guardas

```mermaid
flowchart TD
  A[Navegación a ruta] --> B{"¿(auth) o (app)?"}
  B -- (auth) --> C{cargando?}
  C -- sí --> L1[PantallaCarga]
  C -- no --> D{session?}
  D -- sí --> R1[/Redirect /dashboard/]
  D -- no --> OK1[Muestra login / register]
  B -- (app) --> E{cargando?}
  E -- sí --> L2[PantallaCarga]
  E -- no --> F{session?}
  F -- no --> R2[/Redirect /login/]
  F -- sí --> G{perfil cargado?}
  G -- no --> EP[ErrorPerfil: Reintentar / Cerrar sesión]
  G -- sí --> H{¿ruta SoloAdmin?}
  H -- no --> OK2[Muestra pantalla]
  H -- sí --> I{rol = administrador?}
  I -- sí --> OK2
  I -- no --> R3[/Redirect /dashboard/]
```

| Guarda | Ubicación | Comportamiento |
|---|---|---|
| Raíz | `index.tsx` | `cargando` → `PantallaCarga`; si no, `Redirect` a `/dashboard` o `/login` |
| Autenticación pública | `(auth)/_layout.tsx` | Con sesión redirige a `/dashboard` |
| Autenticación privada | `(app)/_layout.tsx` | Sin sesión `/login`; sin perfil `ErrorPerfil` |
| Rol | `components/SoloAdmin.tsx` | Envuelve en la ruta (no en la pantalla) para `reports`, `usuarios`, `categorias` |
| Alta de proveedor | `ProveedorDetalleScreen` | Si `proveedorId === "nuevo"` y no es administrador, `router.back()` |

**Limitación:** las guardas no impiden ver datos por sí solas; la protección real es RLS (ver [seguridad](03-seguridad-rls-resumen.md)). Un deep link a una ruta restringida llega a `SoloAdmin` y se redirige.

## 4. Navegadores y presentación

| Navegador | Configuración |
|---|---|
| Raíz | `<Slot />` |
| `(app)` | `Stack` con `headerShown: false`; los tres modales con `presentation: "modal"` |
| `(tabs)` | `Tabs` (`headerShown: false`; verde `primaryDark` activo / `textMuted` inactivo); pestañas declaradas explícitamente: `dashboard`, `inventario`, `compras`, `perfil` |
| Stacks por pestaña | `opcionesStackConEncabezado` (encabezado JS `Encabezado`) |
| Banner offline | Superpuesto sobre la barra de pestañas (`bottom = inset + 49/56 + 8`); `pointerEvents="none"`, `accessibilityRole="alert"`; texto «Sin conexión · tus cambios se enviarán al reconectar» |

## 5. Flujos de navegación clave

| Flujo | Secuencia |
|---|---|
| Movimiento rápido | Inventario → `/inventario/[insumoId]` → `router.push({ pathname: "/movimiento-modal", params: { insumoId, delta } })` → confirmar → `router.back()` |
| Compra | `/compras` → `/confirmar-compra-modal?itemId` → confirmar → cierra modal |
| Foto | Detalle → `/scan-modal?insumoId` → subida → vuelve |
| Alta de proveedor | `/compras` → `/compras/proveedor/nuevo` |
| Push | Toque en notificación → `router.push(data.route)` si empieza por `/`, si no `/compras` |
| Cierre de sesión | `cerrarSesion()` → `session = null` → `(app)` redirige a `/login` |

## 6. Pruebas relacionadas

No existen pruebas automatizadas de rutas ni de guardas en `__tests__/` ni `tests/`: los layouts `(app)`/`(auth)`, `index` y `SoloAdmin` **no tienen cobertura** (`__tests__/Encabezado.test.tsx` cubre solo el encabezado). Ver [pruebas de rutas y guardas](../../04-pruebas/diseno/03-pruebas-de-rutas-y-guardas-expo-router.md), que propone los casos pendientes.
