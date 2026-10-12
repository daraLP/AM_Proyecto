// import React, { useState } from "react";
// import { View, Text, TextInput, Button, Alert } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useAuthStore } from "./authStore";
// import type { Rol } from "../../types/database";

// const esquemaRegistro = z.object({
//   nombre: z.string().min(2, "Ingresa tu nombre completo"),
//   correo: z.email({ error: "Correo inválido" }),
//   contrasena: z
//     .string()
//     .min(6, "La contraseña debe tener al menos 6 caracteres"),
// });

// type FormInput = z.input<typeof esquemaRegistro>;
// type FormOutput = z.infer<typeof esquemaRegistro>;

// export function RegisterScreen() {
//   const registrarse = useAuthStore((estado) => estado.registrarse);
//   const [rol, setRol] = useState<Rol>("barista");

//   const {
//     control,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<FormInput, any, FormOutput>({
//     resolver: zodResolver(esquemaRegistro),
//     defaultValues: {
//       nombre: "",
//       correo: "",
//       contrasena: "",
//     },
//   });

//   const onSubmit = async (valores: FormOutput) => {
//     const { error } = await registrarse(
//       valores.correo,
//       valores.contrasena,
//       valores.nombre,
//       rol,
//     );
//     if (error) {
//       Alert.alert("Error al registrarse", error);
//     }
//   };

//   return (
//     <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
//       <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
//         Crear cuenta
//       </Text>

//       <Text>Nombre</Text>
//       <Controller
//         control={control}
//         name="nombre"
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             value={value}
//             onChangeText={onChange}
//             style={{
//               borderWidth: 1,
//               padding: 10,
//               marginBottom: 4,
//               borderRadius: 6,
//             }}
//           />
//         )}
//       />
//       {errors.nombre && (
//         <Text style={{ color: "red" }}>{errors.nombre.message}</Text>
//       )}

//       <Text style={{ marginTop: 12 }}>Correo</Text>
//       <Controller
//         control={control}
//         name="correo"
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             value={value}
//             onChangeText={onChange}
//             autoCapitalize="none"
//             keyboardType="email-address"
//             style={{
//               borderWidth: 1,
//               padding: 10,
//               marginBottom: 4,
//               borderRadius: 6,
//             }}
//           />
//         )}
//       />
//       {errors.correo && (
//         <Text style={{ color: "red" }}>{errors.correo.message}</Text>
//       )}

//       <Text style={{ marginTop: 12 }}>Contraseña</Text>
//       <Controller
//         control={control}
//         name="contrasena"
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             value={value}
//             onChangeText={onChange}
//             secureTextEntry
//             style={{
//               borderWidth: 1,
//               padding: 10,
//               marginBottom: 4,
//               borderRadius: 6,
//             }}
//           />
//         )}
//       />
//       {errors.contrasena && (
//         <Text style={{ color: "red" }}>{errors.contrasena.message}</Text>
//       )}

//       <Text style={{ marginTop: 16, marginBottom: 8 }}>Rol</Text>
//       <View style={{ flexDirection: "row", gap: 12 }}>
//         <Button
//           title="Barista"
//           onPress={() => setRol("barista")}
//           color={rol === "barista" ? "#4a3728" : "#999"}
//         />
//         <Button
//           title="Administrador"
//           onPress={() => setRol("administrador")}
//           color={rol === "administrador" ? "#4a3728" : "#999"}
//         />
//       </View>

//       <View style={{ marginTop: 24 }}>
//         <Button
//           title={isSubmitting ? "Creando cuenta..." : "Registrarse"}
//           onPress={handleSubmit(onSubmit)}
//           disabled={isSubmitting}
//         />
//       </View>
//     </View>
//   );
// }
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
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

const esquemaRegistro = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre completo"),
  correo: z.string().email("Ingresa un correo electrónico válido"),
  contrasena: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});
type FormValues = z.infer<typeof esquemaRegistro>;
export function RegisterScreen() {
  const router = useRouter();
  const registrarse = useAuthStore((e) => e.registrarse);
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
    if (error) return Alert.alert("Error al registrarse", error);
    if (confirmarCorreo) {
      Alert.alert(
        "Revisa tu correo",
        "Te enviamos un enlace para confirmar tu cuenta.",
      );
      router.replace("/login");
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
              onPress={handleSubmit(onSubmit)}
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
