import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton } from "@/components/Boton";
import { useInsumo } from "@/hooks/useInsumos";
import { subirFotoInsumo } from "@/services/fotos";
import { actualizarInsumo } from "@/services/insumos";
import { theme } from "@/theme/theme";
import { ErrorUsuario, mensajeDeError } from "@/utils/errores";
import { useToast } from "@/providers/FeedbackProvider";
import { useAvisoPermiso } from "@/hooks/useAvisoPermiso";

// scan-modal: tomar o elegir la foto de un insumo existente y guardarla en el bucket fotos-insumos
export function FotoInsumoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { insumoId } = useLocalSearchParams<{ insumoId: string }>();
  const insumo = useInsumo(insumoId);
  const [uri, setUri] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const toast = useToast();
  const avisarPermiso = useAvisoPermiso();

  const elegir = async (origen: "camara" | "galeria") => {
    const permiso =
      origen === "camara"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      void avisarPermiso(origen);
      return;
    }
    const opciones: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 };
    const r = origen === "camara" ? await ImagePicker.launchCameraAsync(opciones) : await ImagePicker.launchImageLibraryAsync(opciones);
    if (!r.canceled) setUri(r.assets[0].uri);
  };

  const guardar = async () => {
    if (!uri || !insumoId) return;
    setSubiendo(true);
    try {
      const url = await subirFotoInsumo(uri, insumoId);
      const { error } = await actualizarInsumo(insumoId, { foto_url: url });
      if (error) throw new ErrorUsuario(error);
      void queryClient.invalidateQueries({ queryKey: ["insumo", insumoId] });
      void queryClient.invalidateQueries({ queryKey: ["insumos"] });
      router.back();
      toast.exito("Foto actualizada");
    } catch (e) {
      toast.error("No pudimos guardar la foto", mensajeDeError(e, "Inténtalo de nuevo."));
    } finally {
      setSubiendo(false);
    }
  };

  const vista = uri ?? insumo.data?.foto_url ?? null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contenido}>
        <Text accessibilityRole="header" style={styles.tituloModal}>Foto del insumo</Text>
          <Text style={styles.nombre}>{insumo.data?.nombre ?? "Insumo"}</Text>
        {vista ? (
          <Image source={{ uri: vista }} style={styles.imagen} />
        ) : (
          <View style={[styles.imagen, styles.vacia]}>
            <Text style={styles.vaciaTexto}>Sin foto</Text>
          </View>
        )}
        <Boton titulo="Tomar foto" variante="secundario" onPress={() => void elegir("camara")} disabled={subiendo} />
        <Boton titulo="Elegir de la galería" variante="secundario" onPress={() => void elegir("galeria")} disabled={subiendo} />
        <Boton titulo="Guardar foto" onPress={() => void guardar()} disabled={!uri} cargando={subiendo} />
        <Boton titulo="Cancelar" variante="secundario" onPress={() => router.back()} disabled={subiendo} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tituloModal: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: "700", textAlign: "center", textTransform: "uppercase" },
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  contenido: { alignItems: "stretch", gap: theme.spacing.md, padding: theme.spacing.md },
  nombre: { color: theme.colors.textPrimary, fontSize: theme.fontSize.lg, fontWeight: "800", textAlign: "center" },
  imagen: { alignSelf: "center", borderRadius: theme.borderRadius.lg, height: 240, width: 240 },
  vacia: { alignItems: "center", backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, justifyContent: "center" },
  vaciaTexto: { color: theme.colors.textMuted },
});
