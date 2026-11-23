import React, { useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "expo-router";
import { useAuthStore } from "./authStore";
import { theme } from "../../theme/theme";
import { useDialogo, useToast } from "@/providers/FeedbackProvider";
import { LIMITES, normalizarTexto } from "@/utils/validacion";
import { crearBloqueo } from "@/utils/envioUnico";

const esquemaRegistro = z.object({
  nombre: z
    .string()
    .transform(normalizarTexto)
    .pipe(
      z
        .string()
        .min(2, "Escribe tu nombre (mínimo 2 letras)")
        .max(LIMITES.nombrePersona, `El nombre admite máximo ${LIMITES.nombrePersona} caracteres`),
    ),
  correo: z
    .string()
    .trim()
    .min(1, "Escribe tu correo")
    .max(LIMITES.correo, "El correo es demasiado largo")
    .email("Escribe un correo válido, por ejemplo nombre@correo.com"),
  contrasena: z
    .string()
    .min(LIMITES.contrasenaMin, "Usa al menos 6 caracteres para proteger tu cuenta")
    .max(LIMITES.contrasenaMax, `La contraseña admite máximo ${LIMITES.contrasenaMax} caracteres`),
});
type FormValues = z.infer<typeof esquemaRegistro>;
export function RegisterScreen() {
  const router = useRouter();
  const registrarse = useAuthStore((e) => e.registrarse);
  const toast = useToast();
  const dialogo = useDialogo();
  const bloqueo = useRef(crearBloqueo()).current;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: { nombre: "", correo: "", contrasena: "" },
  });

  const onSubmit = async (v: FormValues) => {
    const { error, confirmarCorreo } = await registrarse(
      v.correo,
      v.contrasena,
      v.nombre.trim(),
    );
    if (error) return toast.error("No pudimos crear tu cuenta", error);
    if (confirmarCorreo) {
      router.replace("/login");
      void dialogo.informar({
        tipo: "exito",
        titulo: "¡Cuenta creada!",
        mensaje: "Te enviamos un enlace de confirmación. Tócalo y luego inicia sesión.",
      });
    }
    // Sin confirmación de correo: la sesión se inicia sola y el navegador cambia de pantalla.
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>POSCafé</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <Controller
                control={control}
                name="nombre"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.nombre && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Tu nombre completo"
                    maxLength={LIMITES.nombrePersona}
                    placeholderTextColor={theme.colors.textMuted}
                  />
                )}
              />
              {errors.nombre && (
                <Text style={styles.errorText}>{errors.nombre.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Correo electrónico</Text>
              <Controller
                control={control}
                name="correo"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.correo && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    maxLength={LIMITES.correo}
                    placeholder="ejemplo@cafe.com"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                )}
              />
              {errors.correo && (
                <Text style={styles.errorText}>{errors.correo.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>
              <Controller
                control={control}
                name="contrasena"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.contrasena && styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                    maxLength={LIMITES.contrasenaMax}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                )}
              />
              {errors.contrasena && (
                <Text style={styles.errorText}>
                  {errors.contrasena.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={() => {
                bloqueo.ejecutar(() => handleSubmit(onSubmit)());
              }}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.buttonText}>Registrarse</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.link}
              onPress={() => router.replace("/login")}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                ¿Ya tienes cuenta?{" "}
                <Text style={styles.linkBold}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  field: { marginBottom: theme.spacing.md },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 48,
  },
  inputError: { borderColor: theme.colors.error },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.sm,
    minHeight: 50,
  },
  buttonDisabled: { backgroundColor: theme.colors.disabled },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
  link: {
    marginTop: theme.spacing.lg,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  linkText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  linkBold: { color: theme.colors.primaryDark, fontWeight: "700" },
});
