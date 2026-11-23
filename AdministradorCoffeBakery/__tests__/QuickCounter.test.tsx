import { fireEvent, render } from "@testing-library/react-native";
import { QuickCounter } from "../src/components/QuickCounter";

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

it("la pulsación larga de un chip resta", () => {
  const onChangeDelta = jest.fn();
  const { getByText } = render(
    <QuickCounter stockActual={10} unidad="kg" incrementos={[5]} onChangeDelta={onChangeDelta} />,
  );
  fireEvent(getByText("+5"), "longPress");
  expect(onChangeDelta).toHaveBeenLastCalledWith(-5);
});

it("muestra el resultado proyectado", () => {
  const { getByText } = render(
    <QuickCounter stockActual={10} unidad="litros" incrementos={[1]} onChangeDelta={jest.fn()} />,
  );
  fireEvent.press(getByText("+1"));
  expect(getByText("Quedará: 11 litros")).toBeTruthy();
});
