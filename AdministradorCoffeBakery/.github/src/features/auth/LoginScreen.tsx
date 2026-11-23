import { useRef } from "react";
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
import { useToast } from "@/providers/FeedbackProvider";
import { LIMITES } from "@/utils/validacion";
import { crearBloqueo } from "@/utils/envioUnico";

const esquemaLogin = z.object({
  correo: z
    .string()
    .trim()
    .min(1, "Escribe tu correo")
    .max(LIMITES.correo, "El correo es demasiado largo")
    .email("Escribe un correo válido, por ejemplo nombre@correo.com"),
  contrasena: z
    .string()
    .min(1, "Escribe tu contraseña para continuar")
    .max(LIMITES.contrasenaMax, `La contraseña admite máximo ${LIMITES.contrasenaMax} caracteres`),
});

type FormValues = z.infer<typeof esquemaLogin>;
export function LoginScreen() {
  const router = useRouter();
  const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion);

  const toast = useToast();
  const bloqueo = useRef(crearBloqueo()).current;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { correo: "", contrasena: "" },
  });

  const onSubmit = async (valores: FormValues) => {
    const { error } = await iniciarSesion(valores.correo, valores.contrasena);
    if (error) {
      toast.error("No pudimos iniciar tu sesión", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title} numberOfLines={1}>
              Iniciar Sesión
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              POSCafé
            </Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Correo electrónico</Text>
              <Controller
                control={control}
                name="correo"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.correo && styles.inputError]}
                    placeholder="ejemplo@cafe.com"
                    placeholderTextColor={theme.colors.textMuted}
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    maxLength={LIMITES.correo}
                  />
                )}
              />
              {errors.correo && (
                <Text style={styles.errorText}>{errors.correo.message}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
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
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.textMuted}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                    maxLength={LIMITES.contrasenaMax}
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
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => router.push("/register")}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                ¿No tienes cuenta?{" "}
                <Text style={styles.linkTextBold}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
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
  fieldContainer: {
    marginBottom: theme.spacing.md,
  },
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
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.sm,
    minHeight: 50,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
  linkContainer: {
    marginTop: theme.spacing.lg,
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
    minHeight: 44,
    justifyContent: "center",
  },
  linkText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  linkTextBold: {
    color: theme.colors.primaryDark,
    fontWeight: "700",
  },
});
