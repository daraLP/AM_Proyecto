import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const INCREMENTOS_POR_DEFECTO = [1, 5, 10];

interface UiState {
  incrementos: number[];
  setIncrementos: (valores: number[]) => void;
  restablecerIncrementos: () => void;
}

function normalizar(valores: number[]): number[] {
  const limpios = valores
    .filter((v) => Number.isFinite(v) && v > 0 && v <= 999_999)
    .map((v) => Math.round(v * 1000) / 1000);
  const unicos = Array.from(new Set(limpios)).slice(0, 4);
  return unicos.length > 0 ? unicos : INCREMENTOS_POR_DEFECTO;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      incrementos: INCREMENTOS_POR_DEFECTO,
      setIncrementos: (valores) => set({ incrementos: normalizar(valores) }),
      restablecerIncrementos: () => set({ incrementos: INCREMENTOS_POR_DEFECTO }),
    }),
    {
      name: "poscafe-ui",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
