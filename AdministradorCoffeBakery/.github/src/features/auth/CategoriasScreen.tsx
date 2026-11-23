import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton } from "@/components/Boton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PantallaCarga } from "@/components/PantallaCarga";
import { useCategorias, useGestionCategorias } from "@/hooks/useCatalogos";
import { theme } from "@/theme/theme";
import { mensajeDeError } from "@/utils/errores";
import { LIMITES, validarTexto } from "@/utils/validacion";
import { useDialogo, useToast } from "@/providers/FeedbackProvider";

// RF-17 (solo administrador): CRUD de categorías
export function CategoriasScreen() {
  const categorias = useCategorias();
  const { crear, renombrar, eliminar } = useGestionCategorias();
  const toast = useToast();
  const dialogo = useDialogo();
  const [nuevo, setNuevo] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicion, setTextoEdicion] = useState("");

  if (categorias.isLoading) return <PantallaCarga />;
  if (categorias.isError) return <ErrorState message={mensajeDeError(categorias.error)} onRetry={() => void categorias.refetch()} />;

  const alFallar = (titulo: string) => (e: Error) => toast.error(titulo, mensajeDeError(e));

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <FlatList
        data={categorias.data ?? []}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
        ListHeaderComponent={
          <View style={styles.nueva}>
            <TextInput
              accessibilityLabel="Nombre de la nueva categoría"
              value={nuevo}
              onChangeText={setNuevo}
              placeholder="Nueva categoría"
              maxLength={LIMITES.categoria}
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />
            <Boton
              titulo="Agregar"
              disabled={nuevo.trim().length < 2}
              cargando={crear.isPending}
              onPress={() => {
                const v = validarTexto(nuevo, { etiqueta: "el nombre de la categoría", min: 2, max: LIMITES.categoria });
                if (!v.ok) return toast.aviso("Revisa el nombre", v.error);
                crear.mutate(v.valor, {
                onSuccess: () => {
                  setNuevo("");
                  toast.exito("Categoría agregada");
                },
                onError: alFallar("No pudimos agregar la categoría"),
              });
              }}
            />
          </View>
        }
        ListEmptyComponent={<EmptyState title="Sin categorías" message="Agrega la primera para clasificar tus insumos." />}
        renderItem={({ item }) => (
          <View style={styles.fila}>
            {editandoId === item.id ? (
              <>
                <TextInput value={textoEdicion} onChangeText={setTextoEdicion} maxLength={LIMITES.categoria} accessibilityLabel="Nuevo nombre de la categoría" style={[styles.input, { flex: 1 }]} autoFocus />
                <Boton
                  titulo="Guardar"
                  disabled={textoEdicion.trim().length < 2}
                  cargando={renombrar.isPending}
                  onPress={() => {
                    const v = validarTexto(textoEdicion, { etiqueta: "el nombre de la categoría", min: 2, max: LIMITES.categoria });
                    if (!v.ok) return toast.aviso("Revisa el nombre", v.error);
                    renombrar.mutate(
                      { id: item.id, nombre: v.valor },
                      {
                        onSuccess: () => {
                          setEditandoId(null);
                          toast.exito("Categoría actualizada");
                        },
                        onError: alFallar("No pudimos renombrar la categoría"),
                      },
                    );
                  }}
                />
              </>
            ) : (
              <>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <Boton titulo="Editar" variante="secundario" onPress={() => { setEditandoId(item.id); setTextoEdicion(item.nombre); }} />
                <Boton
                  titulo="Eliminar"
                  variante="peligro"
                  onPress={async () => {
                    const confirmado = await dialogo.confirmar({
                      titulo: "¿Eliminar categoría?",
                      mensaje: `«${item.nombre}» se quitará de tu lista de categorías.`,
                      textoConfirmar: "Eliminar",
                      peligro: true,
                    });
                    if (!confirmado) return;
                    eliminar.mutate(item.id, {
                      onSuccess: () => toast.exito("Categoría eliminada"),
                      onError: alFallar("No pudimos eliminar la categoría"),
                    });
                  }}
                />
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  lista: { padding: theme.spacing.md },
  nueva: { gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  input: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, borderWidth: 1, color: theme.colors.textPrimary, fontSize: theme.fontSize.md, minHeight: 48, paddingHorizontal: theme.spacing.md },
  fila: { alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, flexDirection: "row", gap: theme.spacing.sm, padding: theme.spacing.md },
  nombre: { color: theme.colors.textPrimary, flex: 1, fontSize: theme.fontSize.md, fontWeight: "700" },
});
