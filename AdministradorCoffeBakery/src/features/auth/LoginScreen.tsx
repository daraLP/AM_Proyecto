// import React from "react";
// import {
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useAuthStore } from "./authStore";
// import type { NativeStackScreenProps } from "@react-navigation/native-stack";
// import type { AuthStackParamList } from "../../navigation/AuthStack";

// const esquemaLogin = z.object({
//   correo: z.email({ error: "Correo inválido" }),
//   contrasena: z.string().min(1, "Ingresa tu contraseña"),
// });

// type FormValues = z.infer<typeof esquemaLogin>;
// type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

// export function LoginScreen({ navigation }: Props) {
//   const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion);

//   const {
//     control,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<FormValues>({
//     resolver: zodResolver(esquemaLogin),
//     defaultValues: { correo: "", contrasena: "" },
//   });

//   const onSubmit = async (valores: FormValues) => {
//     const { error } = await iniciarSesion(valores.correo, valores.contrasena);
//     if (error) {
//       Alert.alert("Error al iniciar sesión", error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.card}>
//         <Text style={styles.title}>Iniciar Sesión</Text>
//         <Text style={styles.subtitle}>POSCafé</Text>

//         <Controller
//           control={control}
//           name="correo"
//           render={({ field: { onChange, value } }) => (
//             <TextInput
//               style={styles.input}
//               placeholder="Correo electrónico"
//               placeholderTextColor="#888"
//               value={value}
//               onChangeText={onChange}
//               autoCapitalize="none"
//               keyboardType="email-address"
//             />
//           )}
//         />
//         {errors.correo && (
//           <Text style={styles.error}>{errors.correo.message}</Text>
//         )}

//         <Controller
//           control={control}
//           name="contrasena"
//           render={({ field: { onChange, value } }) => (
//             <TextInput
//               style={styles.input}
//               placeholder="Contraseña"
//               placeholderTextColor="#888"
//               value={value}
//               onChangeText={onChange}
//               secureTextEntry
//             />
//           )}
//         />
//         {errors.contrasena && (
//           <Text style={styles.error}>{errors.contrasena.message}</Text>
//         )}

//         <TouchableOpacity
//           style={styles.button}
//           onPress={handleSubmit(onSubmit)}
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Entrar</Text>
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.linkContainer}
//           onPress={() => navigation.navigate("Registro")}
//         >
//           <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f6fa",
//     justifyContent: "center",
//     padding: 20,
//   },
//   card: {
//     backgroundColor: "#ffffff",
//     padding: 24,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#2f3640",
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#718093",
//     marginBottom: 24,
//     textAlign: "center",
//   },
//   input: {
//     backgroundColor: "#f1f2f6",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 8,
//     fontSize: 16,
//     color: "#2f3640",
//     marginBottom: 4,
//     borderWidth: 1,
//     borderColor: "#dcdde1",
//   },
//   error: {
//     color: "#e74c3c",
//     marginBottom: 12,
//     fontSize: 13,
//   },
//   button: {
//     backgroundColor: "#2ed573",
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   buttonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   linkContainer: {
//     marginTop: 16,
//     alignItems: "center",
//   },
//   linkText: {
//     color: "#2ed573",
//     fontSize: 14,
//     fontWeight: "600",
//   },
// });

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
import { useAuthStore } from "./authStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import { theme } from "../../theme/theme";

const esquemaLogin = z.object({
  correo: z.string().email("Ingresa un correo electrónico válido"),
  contrasena: z.string().min(1, "Ingresa tu contraseña"),
});

type FormValues = z.infer<typeof esquemaLogin>;
type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion);

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
      Alert.alert("Error al iniciar sesión", error);
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
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => navigation.navigate("Registro")}
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
