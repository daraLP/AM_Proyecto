import * as Location from "expo-location";
import { buscarDireccion, direccionDeCoordenada, formatearDireccion } from "../src/services/geocodificacion";
import { ErrorUsuario } from "../src/utils/errores";

jest.mock("expo-location", () => ({
  geocodeAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

const geocode = Location.geocodeAsync as jest.Mock;
const reverso = Location.reverseGeocodeAsync as jest.Mock;
beforeEach(() => jest.clearAllMocks());

describe("buscarDireccion", () => {
  it("devuelve la primera coincidencia", async () => {
    geocode.mockResolvedValue([{ latitude: 31.8667, longitude: -116.5964 }]);
    await expect(buscarDireccion("Av. Ruiz 100, Ensenada")).resolves.toEqual({ lat: 31.8667, lng: -116.5964 });
  });

  it("pide más datos si el texto es muy corto, sin llamar al geocodificador", async () => {
    await expect(buscarDireccion("  ab ")).rejects.toThrow(/dirección completa/);
    expect(geocode).not.toHaveBeenCalled();
  });

  it("explica qué hacer si no hay resultados", async () => {
    geocode.mockResolvedValue([]);
    const error = await buscarDireccion("Calle inexistente 999").catch((e) => e);
    expect(error).toBeInstanceOf(ErrorUsuario);
    expect(error.message).toMatch(/No encontramos esa dirección/);
    expect(error.message).toMatch(/pin a mano/);
  });

  it("traduce una falla del servicio a un mensaje amable", async () => {
    geocode.mockRejectedValue(new Error("kCLErrorDomain error 2"));
    const error = await buscarDireccion("Av. Ruiz 100, Ensenada").catch((e) => e);
    expect(error.message).not.toMatch(/kCLError/);
    expect(error.message).toMatch(/pin a mano/);
  });
});

describe("direccionDeCoordenada", () => {
  it("arma una dirección legible", async () => {
    reverso.mockResolvedValue([{ street: "Av. Ruiz", streetNumber: "100", district: "Centro", city: "Ensenada", region: "Baja California" }]);
    await expect(direccionDeCoordenada({ lat: 31.86, lng: -116.6 })).resolves.toBe("Av. Ruiz 100, Centro, Ensenada, Baja California");
  });

  it("nunca lanza: si falla devuelve null", async () => {
    reverso.mockRejectedValue(new Error("sin red"));
    await expect(direccionDeCoordenada({ lat: 0, lng: 0 })).resolves.toBeNull();
    reverso.mockResolvedValue([]);
    await expect(direccionDeCoordenada({ lat: 0, lng: 0 })).resolves.toBeNull();
  });
});

describe("formatearDireccion", () => {
  it("omite partes vacías y repetidas", () => {
    expect(formatearDireccion({ street: "Calle 1", city: "Ensenada", region: "Ensenada", district: null } as never)).toBe("Calle 1, Ensenada");
  });
});
