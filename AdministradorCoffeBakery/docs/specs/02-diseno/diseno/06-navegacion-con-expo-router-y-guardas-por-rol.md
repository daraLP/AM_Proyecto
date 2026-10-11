# Fase 2 · Diseño: Navegación con Expo Router y guardas por rol

> **POSCafé · Specs · Fase 2 · Diseño** · Índice general: `docs/specs/README.md`


**Configuración base**

```json
// app.json (fragmento)
{ "expo": { "scheme": "poscafe",
  "plugins": ["expo-router", "expo-notifications"],
  "experiments": { "typedRoutes": true } } }
// package.json → "main": "expo-router/entry"
// tsconfig.json → "paths": { "@/*": ["./src/*"] }
```

**Mapa de rutas, roles y tipo de pantalla**

| Ruta (URL) | Archivo en `src/app` | Tipo | Acceso |
|---|---|---|---|
| `/login`, `/register` | `(auth)/login.tsx`, `register.tsx` | Stack | Solo sin sesión |
| `/dashboard` | `(app)/(tabs)/dashboard/index.tsx` | Tab | Admin y barista |
| `/dashboard/reports` | `…/dashboard/reports.tsx` | Stack | **Solo administrador** |
| `/inventario` | `…/inventario/index.tsx` | Tab | Admin y barista (acciones de edición solo admin) |
| `/inventario/[insumoId]` | `…/inventario/[insumoId].tsx` | Stack | Admin y barista (detalle + contador rápido) |
| `/inventario/form?id=` | `…/inventario/form.tsx` | Stack | **Solo administrador** |
| `/compras` | `…/compras/index.tsx` | Tab | Admin y barista (lista + mapa) |
| `/compras/proveedor/[proveedorId]` | `…/compras/proveedor/[proveedorId].tsx` | Stack | Lectura: todos; edición: admin |
| `/perfil` | `…/perfil/index.tsx` | Tab | Admin y barista |
| `/perfil/usuarios` | `…/perfil/usuarios.tsx` | Stack | **Solo administrador** (gestión de roles) |
| `/movimiento-modal?insumoId=` | `(app)/movimiento-modal.tsx` | Modal | Admin y barista |
| `/scan-modal` | `(app)/scan-modal.tsx` | Modal | Solo administrador |
| `/confirmar-compra-modal?itemId=` | `(app)/confirmar-compra-modal.tsx` | Modal | Admin y barista |

**Guardas (capa 1, UX; la seguridad real son RLS y RPC)**

```tsx
// src/app/(auth)/_layout.tsx
export default function AuthLayout() {
  const { session, cargando } = useAuthStore();
  if (cargando) return <PantallaCarga />;
  if (session) return <Redirect href="/dashboard" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

// src/app/(app)/_layout.tsx
export default function AppLayout() {
  const { session, perfil, cargando } = useAuthStore();
  if (cargando) return <PantallaCarga />;
  if (!session) return <Redirect href="/login" />;
  if (!perfil) return <ErrorPerfil />;           // perfil no cargó: reintentar o cerrar sesión
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="movimiento-modal" options={{ presentation: "modal", headerShown: true, title: "Registrar movimiento" }} />
      <Stack.Screen name="scan-modal" options={{ presentation: "modal", headerShown: true, title: "Foto del insumo" }} />
      <Stack.Screen name="confirmar-compra-modal" options={{ presentation: "modal", headerShown: true, title: "Confirmar compra" }} />
    </Stack>
  );
}

// src/components/SoloAdmin.tsx (se envuelve en reports, form, usuarios y scan-modal)
export function SoloAdmin({ children }: { children: React.ReactNode }) {
  const esAdmin = useEsAdmin();
  return esAdmin ? <>{children}</> : <Redirect href="/dashboard" />;
}
```

**Rutas delgadas:** cada archivo de `src/app` solo re-exporta la pantalla de su feature, así la lógica sigue en `features/`:

```tsx
// src/app/(app)/(tabs)/inventario/index.tsx
export { InventarioListScreen as default } from "@/features/insumos/InventarioListScreen";
```

**Cambios respecto a React Navigation**

| Antes | Después |
|---|---|
| `NavigationContainer` en `App.tsx` y `RootNavigator` | `src/app/_layout.tsx` + layouts `(auth)` y `(app)` |
| `navigation.navigate("InsumoForm", { insumo })` | `router.push({ pathname: "/inventario/form", params: { id } })`; la pantalla consulta el insumo por `id` (ADR-06) |
| `InventarioStackParamList` | Rutas tipadas (`typedRoutes`) y `useLocalSearchParams<{ insumoId: string }>()` |
| `useFocusEffect` + `useState` para cargar datos | Hooks de TanStack Query (`useInsumos`, etc.) con invalidación |
| Notificación push → `navigation.navigate` | `router.push("/compras")` desde el manejador de respuesta |

**Mapa de migración de archivos existentes**

| Archivo actual | Acción |
|---|---|
| `App.tsx`, `index.ts` | Eliminar; usar `expo-router/entry` |
| `navigation/RootNavigator.tsx` | Sustituir por `app/_layout.tsx` + guardas de `(auth)` y `(app)` |
| `navigation/AuthStack.tsx` | `app/(auth)/_layout.tsx` + `login.tsx` + `register.tsx` |
| `navigation/AppTabs.tsx` | `app/(app)/(tabs)/_layout.tsx` |
| `navigation/DashboardStack.tsx` | `…/dashboard/_layout.tsx` + `index.tsx` + `reports.tsx` |
| `navigation/InventarioStack.tsx` | `…/inventario/_layout.tsx` + `index.tsx` + `[insumoId].tsx` + `form.tsx` |
| `features/**/…Screen.tsx` | Se conservan; se ajustan a `useRouter` / `useLocalSearchParams` |
| `/types/supabase.ts` (UTF-16) | Regenerar en UTF-8 como `src/types/database.types.ts` y borrar el duplicado |

**Generar tipos en UTF-8 (Windows):** `cmd /c "npx supabase gen types typescript --linked > src\types\database.types.ts"`, o en PowerShell `... | Out-File -Encoding utf8 src/types/database.types.ts`. Con `>` de PowerShell 5 el archivo sale en UTF-16.
