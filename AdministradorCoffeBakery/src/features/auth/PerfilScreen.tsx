import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton } from "@/components/Boton";
import { useGestionUsuarios } from "@/hooks/useCatalogos";
import { INCREMENTOS_POR_DEFECTO, useUiStore } from "@/store/uiStore";
import { formatearCantidad, parsearNumero } from "@/utils/formato";
import { useAuthStore, useEsAdmin } from "./authStore";
import { theme } from "../../theme/theme";
import { mensajeDeError } from "@/utils/errores";
import { useToast } from "@/providers/FeedbackProvider";
import { LIMITES, validarTexto } from "@/utils/validacion";

export function PerfilScreen() {
  const router = useRouter();
  const perfil = useAuthStore((estado) => estado.perfil);
  const session = useAuthStore((estado) => estado.session);
  const cargarPerfil = useAuthStore((estado) => estado.cargarPerfil);
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);
  const esAdmin = useEsAdmin();

  const incrementos = useUiStore((s) => s.incrementos);
  const setIncrementos = useUiStore((s) => s.setIncrementos);
  const restablecerIncrementos = useUiStore((s) => s.restablecerIncrementos);

  const toast = useToast();
  const { actualizarNombre } = useGestionUsuarios();
  const [nombre, setNombre] = useState(perfil?.nombre ?? "");
  const [textoIncrementos, setTextoIncrementos] = useState(incrementos.map(formatearCantidad).join(", "));

  const guardarNombre = () => {
    if (!perfil) return;
    const v = validarTexto(nombre, { etiqueta: "tu nombre", min: 2, max: LIMITES.nombrePersona });
    if (!v.ok) return toast.aviso("Revisa tu nombre", v.error);
    actualizarNombre.mutate(
      { userId: perfil.id, nombre: v.valor },
      {
        onSuccess: () => {
          if (session) void cargarPerfil(session.user.id);
          toast.exito("Nombre actualizado");
        },
        onError: (e) => toast.error("No pudimos guardar tu nombre", mensajeDeError(e)),
      },
    );
  };

  const guardarIncrementos = () => {
    const valores = textoIncrementos
      .split(/[\s;]+|,(?=\s)/)
      .map((t) => parsearNumero(t.replace(/,$/, "")))
      .filter((n) => n > 0);
    if (valores.length === 0) return toast.aviso("Revisa los incrementos", "Escribe números mayores que 0 separados por coma, por ejemplo: 1, 5, 10.");
    setIncrementos(valores);
    // Se relee del store ya normalizado (sin duplicados, máx. 4)
    const guardados = useUiStore.getState().incrementos.map(formatearCantidad).join(", ");
    setTextoIncrementos(guardados);
    toast.exito("Incrementos guardados", `Tu contador mostrará: ${guardados}.`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{perfil?.nombre ? perfil.nombre.charAt(0).toUpperCase() : "U"}</Text>
            </View>
            <Text style={styles.nombreText} numberOfLines={1} ellipsizeMode="tail">
              {perfil?.nombre ?? "Usuario"}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText} numberOfLines={1}>
                {perfil?.rol ?? "Sin rol"}
              </Text>
            </View>
            {session?.user.email ? <Text style={styles.correo}>{session.user.email}</Text> : null}
          </View>

          <View style={styles.seccion}>
            <Text style={styles.titulo}>Mi nombre</Text>
            <TextInput
              accessibilityLabel="Nombre"
              value={nombre}
              onChangeText={setNombre}
              maxLength={LIMITES.nombrePersona}
              style={styles.input}
              placeholderTextColor={theme.colors.textMuted}
            />
            <Boton
              titulo="Guardar nombre"
              variante="secundario"
              onPress={guardarNombre}
              cargando={actualizarNombre.isPending}
              disabled={nombre.trim() === perfil?.nombre}
            />
          </View>

          <View style={styles.seccion}>
            <Text style={styles.titulo}>Incrementos rápidos</Text>
            <Text style={styles.ayuda}>
              Los chips del contador de stock (máximo 4). Sepáralos con coma. Por defecto: {INCREMENTOS_POR_DEFECTO.join(", ")}.
            </Text>
            <TextInput
              accessibilityLabel="Incrementos rápidos"
              value={textoIncrementos}
              onChangeText={setTextoIncrementos}
              maxLength={30}
              keyboardType="numbers-and-punctuation"
              style={styles.input}
              placeholder="1, 5, 10"
              placeholderTextColor={theme.colors.textMuted}
            />
            <View style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Boton titulo="Guardar" variante="secundario" onPress={guardarIncrementos} />
              </View>
              <View style={{ flex: 1 }}>
                <Boton
                  titulo="Restablecer"
                  variante="secundario"
                  onPress={() => {
                    restablecerIncrementos();
                    setTextoIncrementos(INCREMENTOS_POR_DEFECTO.join(", "));
                    toast.info("Incrementos restablecidos");
                  }}
                />
              </View>
            </View>
          </View>

          {esAdmin && (
            <View style={styles.seccion}>
              <Text style={styles.titulo}>Administración</Text>
              <Boton titulo="Gestionar usuarios y roles" variante="secundario" onPress={() => router.push("/perfil/usuarios")} />
              <Boton titulo="Categorías" variante="secundario" onPress={() => router.push("/perfil/categorias")} />
            </View>
          )}

          <Boton titulo="Cerrar sesión" variante="peligro" onPress={() => void cerrarSesion()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  contenido: { gap: theme.spacing.md, padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  avatarInitial: { fontSize: theme.fontSize.xxl, fontWeight: "700", color: theme.colors.primaryDark },
  nombreText: { fontSize: theme.fontSize.lg, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.xs, textAlign: "center" },
  badge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeText: { fontSize: theme.fontSize.xs, fontWeight: "600", color: theme.colors.textSecondary, textTransform: "capitalize" },
  correo: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm, marginTop: theme.spacing.sm },
  seccion: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, gap: theme.spacing.sm, padding: theme.spacing.md },
  titulo: { color: theme.colors.textPrimary, fontSize: theme.fontSize.md, fontWeight: "800" },
  ayuda: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  input: { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, borderWidth: 1, color: theme.colors.textPrimary, fontSize: theme.fontSize.md, minHeight: 48, paddingHorizontal: theme.spacing.md },
  fila: { flexDirection: "row", gap: theme.spacing.sm },
});
