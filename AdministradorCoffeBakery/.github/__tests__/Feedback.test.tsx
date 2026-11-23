import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Aviso } from "../src/components/Aviso";
import { FeedbackProvider, useDialogo, useToast } from "../src/providers/FeedbackProvider";

const metricas = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
};

function Probar({ alConfirmar }: { alConfirmar: (r: boolean) => void }) {
  const toast = useToast();
  const dialogo = useDialogo();
  return (
    <>
      <Text onPress={() => toast.exito("Insumo guardado", "Café en grano ahora tiene 12 kg.")}>exito</Text>
      <Text onPress={() => toast.error("No pudimos guardar", "Revisa tu conexión.")}>error</Text>
      <Text
        onPress={() =>
          void dialogo
            .confirmar({ titulo: "¿Eliminar proveedor?", mensaje: "No se puede deshacer.", textoConfirmar: "Eliminar", peligro: true })
            .then(alConfirmar)
        }
      >
        confirmar
      </Text>
      <Text onPress={() => void dialogo.informar({ titulo: "Cuenta creada", mensaje: "Revisa tu correo." })}>informar</Text>
    </>
  );
}

function montar(alConfirmar = jest.fn()) {
  return render(
    <SafeAreaProvider initialMetrics={metricas}>
      <FeedbackProvider>
        <Probar alConfirmar={alConfirmar} />
      </FeedbackProvider>
    </SafeAreaProvider>,
  );
}

describe("toast", () => {
  it("muestra título y detalle, y se cierra al tocarlo", () => {
    montar();
    fireEvent.press(screen.getByText("exito"));
    expect(screen.getByText("Insumo guardado")).toBeTruthy();
    expect(screen.getByText("Café en grano ahora tiene 12 kg.")).toBeTruthy();
  });

  it("un toast nuevo reemplaza al anterior", () => {
    montar();
    fireEvent.press(screen.getByText("exito"));
    fireEvent.press(screen.getByText("error"));
    expect(screen.getByText("No pudimos guardar")).toBeTruthy();
    expect(screen.queryByText("Insumo guardado")).toBeNull();
  });
});

describe("diálogo", () => {
  it("confirmar resuelve true al aceptar", async () => {
    const alConfirmar = jest.fn();
    montar(alConfirmar);
    fireEvent.press(screen.getByText("confirmar"));
    expect(screen.getByText("¿Eliminar proveedor?")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByText("Eliminar"));
    });
    expect(alConfirmar).toHaveBeenCalledWith(true);
    expect(screen.queryByText("¿Eliminar proveedor?")).toBeNull();
  });

  it("confirmar resuelve false al cancelar", async () => {
    const alConfirmar = jest.fn();
    montar(alConfirmar);
    fireEvent.press(screen.getByText("confirmar"));
    await act(async () => {
      fireEvent.press(screen.getByText("Cancelar"));
    });
    expect(alConfirmar).toHaveBeenCalledWith(false);
  });

  it("informar muestra un solo botón «Entendido»", async () => {
    montar();
    fireEvent.press(screen.getByText("informar"));
    expect(screen.getByText("Cuenta creada")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByText("Entendido"));
    });
    expect(screen.queryByText("Cuenta creada")).toBeNull();
  });
});

it("Aviso en línea muestra el mensaje", () => {
  render(<Aviso tipo="error" mensaje="Revisa la cantidad." />);
  expect(screen.getByText("Revisa la cantidad.")).toBeTruthy();
});

it("los hooks fallan con un mensaje claro fuera del proveedor", () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  function Suelto() {
    useToast();
    return null;
  }
  expect(() => render(<Suelto />)).toThrow(/FeedbackProvider/);
  spy.mockRestore();
});
