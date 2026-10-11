# Fase 4 · Pruebas: Pruebas unitarias y de componentes (Jest)

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: `docs/specs/README.md`


```js
// jest.config.js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  collectCoverageFrom: ["src/services/**", "src/hooks/**", "src/components/**", "src/utils/**"],
  coverageThreshold: { global: { lines: 80 } },
};
```

```ts
// __tests__/traducirError.test.ts
import { traducirError } from "../src/services/movimientos";

test("traduce stock insuficiente", () => {
  expect(traducirError({ code: "23514", message: "stock_insuficiente" }))
    .toBe("No hay stock suficiente para esta salida.");
});
test("traduce falta de permisos", () => {
  expect(traducirError({ code: "42501", message: "x" }))
    .toBe("No tienes permiso para realizar esta acción.");
});
```

```tsx
// __tests__/QuickCounter.test.tsx
it("no permite restar más que el stock actual", () => {
  const onChangeDelta = jest.fn();
  const { getByLabelText } = render(
    <QuickCounter stockActual={2} unidad="kg" incrementos={[1, 5, 10]} onChangeDelta={onChangeDelta} />,
  );
  fireEvent.press(getByLabelText("Restar"));
  fireEvent.press(getByLabelText("Restar"));
  fireEvent.press(getByLabelText("Restar"));
  expect(onChangeDelta).toHaveBeenLastCalledWith(-2);
});

it("un chip suma su incremento", () => {
  const onChangeDelta = jest.fn();
  const { getByText } = render(
    <QuickCounter stockActual={0} unidad="unidades" incrementos={[1, 5, 10]} onChangeDelta={onChangeDelta} />,
  );
  fireEvent.press(getByText("+5"));
  expect(onChangeDelta).toHaveBeenLastCalledWith(5);
});
```
