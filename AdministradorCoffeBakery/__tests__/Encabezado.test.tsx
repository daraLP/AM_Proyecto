import type { ComponentProps } from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Encabezado } from "../src/components/Encabezado";

const metricas = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
};

function montar(props: Record<string, unknown>) {
  const base = { options: { title: "Inventario" }, route: { name: "index" }, navigation: { goBack: jest.fn() } };
  const todo = Object.assign({}, base, props) as unknown as ComponentProps<typeof Encabezado>;
  return render(
    <SafeAreaProvider initialMetrics={metricas}>
      <Encabezado {...todo} />
    </SafeAreaProvider>,
  );
}

it("muestra el título y no muestra Volver en la pantalla raíz", () => {
  const { getByText, queryByLabelText } = montar({});
  expect(getByText("Inventario")).toBeTruthy();
  expect(queryByLabelText("Volver")).toBeNull();
});

it("muestra Volver y regresa al pulsarlo", () => {
  const goBack = jest.fn();
  const { getByLabelText, getByText } = montar({ back: { title: "Compras" }, navigation: { goBack } });
  expect(getByText("Compras")).toBeTruthy();
  fireEvent.press(getByLabelText("Volver"));
  expect(goBack).toHaveBeenCalled();
});
