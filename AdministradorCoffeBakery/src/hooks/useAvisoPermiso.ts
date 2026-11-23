import { useCallback } from "react";
import { Linking } from "react-native";
import { useDialogo } from "@/providers/FeedbackProvider";

// Permiso de cámara/galería denegado: explica por qué y lleva directo a Ajustes
export function useAvisoPermiso() {
  const dialogo = useDialogo();
  return useCallback(
    (origen: "camara" | "galeria") =>
      dialogo.informar({
        tipo: "aviso",
        titulo: "Necesitamos tu permiso",
        mensaje:
          origen === "camara"
            ? "Para tomar la foto, permite el acceso a la cámara en los Ajustes de tu teléfono."
            : "Para elegir una foto, permite el acceso a tus fotos en los Ajustes de tu teléfono.",
        textoCerrar: "Ahora no",
        accion: { texto: "Abrir Ajustes", alPulsar: () => void Linking.openSettings() },
      }),
    [dialogo],
  );
}
