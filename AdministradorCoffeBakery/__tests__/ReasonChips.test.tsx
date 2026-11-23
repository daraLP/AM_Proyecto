import { fireEvent, render } from "@testing-library/react-native";
import { ReasonChips } from "../src/components/ReasonChips";
import { MOTIVOS } from "../src/types/database";

it("muestra los 5 motivos y devuelve el elegido", () => {
  const onChange = jest.fn();
  const { getByText } = render(<ReasonChips value={null} onChange={onChange} />);
  expect(MOTIVOS).toHaveLength(5);
  fireEvent.press(getByText("Merma/Vencido"));
  expect(onChange).toHaveBeenCalledWith("Merma/Vencido");
});
