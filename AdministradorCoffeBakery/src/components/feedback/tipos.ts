import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme/theme";

// Un solo vocabulario visual para toasts, diálogos y avisos en línea
export type TipoAviso = "exito" | "error" | "info" | "aviso";
export type NombreIcono = ComponentProps<typeof Ionicons>["name"];

export interface EstiloAviso {
  icono: NombreIcono;
  color: string; // acento: icono y franja
  fondo: string; // fondo suave del icono / aviso en línea
}

export const ESTILOS_AVISO: Record<TipoAviso, EstiloAviso> = {
  exito: { icono: "checkmark-circle", color: theme.colors.primaryDark, fondo: theme.colors.primaryLight },
  error: { icono: "close-circle", color: theme.colors.error, fondo: theme.colors.errorLight },
  info: { icono: "information-circle", color: theme.colors.info, fondo: theme.colors.infoLight },
  aviso: { icono: "warning", color: theme.colors.warningDark, fondo: "#FFF4D6" },
};
