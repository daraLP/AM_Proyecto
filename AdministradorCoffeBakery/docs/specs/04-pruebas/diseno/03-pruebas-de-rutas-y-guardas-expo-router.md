# Fase 4 · Pruebas: Pruebas de rutas y guardas (Expo Router)

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: `docs/specs/README.md`


```tsx
// __tests__/guardas.test.tsx
import { renderRouter, screen } from "expo-router/testing-library";
import { useAuthStore } from "@/features/auth/authStore";

jest.mock("@/features/auth/authStore");
const mockEstado = (e: object) =>
  (useAuthStore as unknown as jest.Mock).mockImplementation((sel?: (s: object) => unknown) => (sel ? sel(e) : e));

it("sin sesión redirige a /login", () => {
  mockEstado({ session: null, perfil: null, cargando: false });
  renderRouter("./src/app", { initialUrl: "/dashboard" });
  expect(screen).toHavePathname("/login");
});

it("un barista no accede a /dashboard/reports", () => {
  mockEstado({ session: {}, perfil: { id: "1", nombre: "B", rol: "barista" }, cargando: false });
  renderRouter("./src/app", { initialUrl: "/dashboard/reports" });
  expect(screen).toHavePathname("/dashboard");
});
```
