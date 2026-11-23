# Fase 4 · Pruebas: Rutas y guardas de Expo Router

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: [`../../README.md`](../../README.md)

## 1. Estado actual

**No existen pruebas de rutas ni de guardas** en el repositorio (H-14). Los únicos archivos relacionados con navegación son `__tests__/Encabezado.test.tsx` (encabezado propio) y la configuración de `typedRoutes`, que valida *en compilación* la existencia de rutas (`tsc --noEmit`).

| Guarda | Archivo | Cobertura |
|---|---|---|
| Redirección raíz | `src/app/index.tsx` | ⬜ |
| `(auth)/_layout` (con sesión → `/dashboard`) | `src/app/(auth)/_layout.tsx` | ⬜ |
| `(app)/_layout` (sin sesión → `/login`; sin perfil → `ErrorPerfil`; banner offline) | `src/app/(app)/_layout.tsx` | ⬜ |
| `SoloAdmin` | `src/components/SoloAdmin.tsx` | ⬜ |
| Alta de proveedor solo admin | `ProveedorDetalleScreen` | ⬜ |
| *Deep link* de push | `usePushNotifications` | ⬜ |

## 2. Estrategia propuesta

Herramienta: `expo-router/testing-library` (`renderRouter`) con `jest-expo`, apoyada en RNTL. Se sustituye `useAuthStore` mediante `useAuthStore.setState({...})` y se *mockean* `usePushNotifications`, `useRealtimeInvalidacion` y `useEstaOnline` para aislar los layouts.

```ts
// Esquema (no existe en el repositorio)
import { renderRouter, screen } from "expo-router/testing-library";
import { useAuthStore } from "@/features/auth/authStore";

test("sin sesión, /dashboard redirige a /login", async () => {
  useAuthStore.setState({ session: null, perfil: null, cargando: false });
  renderRouter("./src/app", { initialUrl: "/dashboard" });
  expect(screen).toHavePathname("/login");
});
```

> El fragmento es una propuesta; la ruta `./src/app` y las utilidades `toHavePathname` dependen de la versión de `expo-router` (~58) y deben verificarse al implementarlo.

## 3. Casos de prueba propuestos

| ID | Escenario | Estado inicial | Resultado esperado |
|---|---|---|---|
| RT-01 | Arranque cargando | `cargando = true` | `PantallaCarga` en `/` |
| RT-02 | Raíz sin sesión | `session = null` | Redirige a `/login` |
| RT-03 | Raíz con sesión | sesión + perfil | Redirige a `/dashboard` |
| RT-04 | Login con sesión activa | sesión | `(auth)` redirige a `/dashboard` |
| RT-05 | Ruta privada sin sesión | `session = null` | `/login` |
| RT-06 | Sesión sin perfil | `perfil = null` | `ErrorPerfil` con «Reintentar» y «Cerrar sesión» |
| RT-07 | Barista abre `/dashboard/reports` | `rol = barista` | Redirige a `/dashboard` |
| RT-08 | Barista abre `/perfil/usuarios` | idem | Redirige a `/dashboard` |
| RT-09 | Barista abre `/perfil/categorias` | idem | Redirige a `/dashboard` |
| RT-10 | Administrador abre las tres rutas | `rol = administrador` | Muestra la pantalla |
| RT-11 | Barista abre `/compras/proveedor/nuevo` | `rol = barista` | `router.back()` |
| RT-12 | Banner offline | `useEstaOnline = false` | Texto «Sin conexión · tus cambios se enviarán al reconectar» |
| RT-13 | Pestañas | sesión + perfil | 4 pestañas: Dashboard, Inventario, Compras, Perfil |
| RT-14 | Toque en push con `data.route = "/compras"` | — | Navega a `/compras` |
| RT-15 | Push sin ruta o con ruta no relativa (`"https://…"`) | — | Navega a `/compras` |
| RT-16 | Modal de movimiento | — | `/movimiento-modal?insumoId=…` se presenta como modal |

## 4. Criterio de aceptación

Las guardas son **UX**, no seguridad: aun con RT-07…RT-10 verdes, la protección real se valida en pgTAP (`rls_y_stock.test.sql`, casos 2, 13, 14, 17, 22).
