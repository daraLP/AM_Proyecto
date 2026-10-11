// import React from "react";
// import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import type { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { supabase } from "../../lib/supabaseClient";
// import type { InventarioStackParamList } from "../../navigation/InventarioStack";

// const esquemaInsumo = z.object({
//   nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
//   unidad_medida: z.enum(["kg", "litros", "unidades", "cajas"]),
//   stock_actual: z.coerce.number().min(0, "El stock no puede ser negativo"),
//   stock_minimo: z.coerce
//     .number()
//     .min(0, "El stock mínimo no puede ser negativo"),
// });

// type FormInput = z.input<typeof esquemaInsumo>;
// type FormOutput = z.infer<typeof esquemaInsumo>;

// type Props = NativeStackScreenProps<InventarioStackParamList, "InsumoForm">;

// export function InsumoFormScreen({ route, navigation }: Props) {
//   const insumoExistente = route.params?.insumo;

//   const {
//     control,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<FormInput, any, FormOutput>({
//     resolver: zodResolver(esquemaInsumo),
//     defaultValues: {
//       nombre: insumoExistente?.nombre ?? "",
//       unidad_medida: insumoExistente?.unidad_medida ?? "unidades",
//       stock_actual: insumoExistente?.stock_actual ?? 0,
//       stock_minimo: insumoExistente?.stock_minimo ?? 0,
//     },
//   });

//   const onSubmit = async (valores: FormOutput) => {
//     const { error } = insumoExistente
//       ? await supabase
//           .from("insumos")
//           .update(valores)
//           .eq("id", insumoExistente.id)
//       : await supabase.from("insumos").insert(valores);

//     if (error) {
//       Alert.alert("Error al guardar", error.message);
//       return;
//     }

//     navigation.goBack();
//   };

//   return (
//     <ScrollView contentContainerStyle={{ padding: 20 }}>
//       <Text>Nombre del insumo</Text>
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

//       <Text style={{ marginTop: 12 }}>
//         Unidad de medida (kg, litros, unidades, cajas)
//       </Text>
//       <Controller
//         control={control}
//         name="unidad_medida"
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
//       {errors.unidad_medida && (
//         <Text style={{ color: "red" }}>{errors.unidad_medida.message}</Text>
//       )}

//       <Text style={{ marginTop: 12 }}>Stock actual</Text>
//       <Controller
//         control={control}
//         name="stock_actual"
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             value={String(value)}
//             onChangeText={onChange}
//             keyboardType="numeric"
//             style={{
//               borderWidth: 1,
//               padding: 10,
//               marginBottom: 4,
//               borderRadius: 6,
//             }}
//           />
//         )}
//       />
//       {errors.stock_actual && (
//         <Text style={{ color: "red" }}>{errors.stock_actual.message}</Text>
//       )}

//       <Text style={{ marginTop: 12 }}>Stock mínimo</Text>
//       <Controller
//         control={control}
//         name="stock_minimo"
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             value={String(value)}
//             onChangeText={onChange}
//             keyboardType="numeric"
//             style={{
//               borderWidth: 1,
//               padding: 10,
//               marginBottom: 4,
//               borderRadius: 6,
//             }}
//           />
//         )}
//       />
//       {errors.stock_minimo && (
//         <Text style={{ color: "red" }}>{errors.stock_minimo.message}</Text>
//       )}

//       <View style={{ marginTop: 20 }}>
//         <Button
//           title={isSubmitting ? "Guardando..." : "Guardar"}
//           onPress={handleSubmit(onSubmit)}
//           disabled={isSubmitting}
//         />
//       </View>
//     </ScrollView>
//   );
// }
import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "../../lib/supabaseClient";
import type { InventarioStackParamList } from "../../navigation/InventarioStack";
import { theme } from "../../theme/theme";
import { crearInsumo, actualizarInsumo } from "../../services/insumos";

const esquemaInsumo = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  unidad_medida: z.enum(["kg", "litros", "unidades", "cajas"]),
  stock_actual: z.coerce.number().min(0, "El stock no puede ser negativo"),
  stock_minimo: z.coerce
    .number()
    .min(0, "El stock mínimo no puede ser negativo"),
});

type FormInput = z.input<typeof esquemaInsumo>;
type FormOutput = z.infer<typeof esquemaInsumo>;

type Props = NativeStackScreenProps<InventarioStackParamList, "InsumoForm">;

const UNIDADES: Array<{
  label: string;
  value: "kg" | "litros" | "unidades" | "cajas";
}> = [
  { label: "Kg", value: "kg" },
  { label: "Litros", value: "litros" },
  { label: "Unidades", value: "unidades" },
  { label: "Cajas", value: "cajas" },
];

export function InsumoFormScreen({ route, navigation }: Props) {
  const insumoExistente = route.params?.insumo;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(esquemaInsumo),
    defaultValues: {
      nombre: insumoExistente?.nombre ?? "",
      unidad_medida: insumoExistente?.unidad_medida ?? "unidades",
      stock_actual: insumoExistente?.stock_actual ?? 0,
      stock_minimo: insumoExistente?.stock_minimo ?? 0,
    },
  });

  const unidadSeleccionada = watch("unidad_medida");

  const onSubmit = async (valores: FormOutput) => {
    const { stock_actual, ...datos } = valores;
    const { error } = insumoExistente
      ? await actualizarInsumo(insumoExistente.id, datos)
      : await crearInsumo(datos, stock_actual);

    if (error) return Alert.alert("Error al guardar", error);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
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
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nombre del insumo</Text>
              <Controller
                control={control}
                name="nombre"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="ej. Café Grano Arábica"
                    placeholderTextColor={theme.colors.textMuted}
                    style={[styles.input, errors.nombre && styles.inputError]}
                  />
                )}
              />
              {errors.nombre && (
                <Text style={styles.errorText}>{errors.nombre.message}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Unidad de Medida</Text>
              <View style={styles.unitsGrid}>
                {UNIDADES.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.unitChip,
                      unidadSeleccionada === item.value &&
                        styles.unitChipActive,
                    ]}
                    onPress={() => setValue("unidad_medida", item.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.unitChipText,
                        unidadSeleccionada === item.value &&
                          styles.unitChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.unidad_medida && (
                <Text style={styles.errorText}>
                  {errors.unidad_medida.message}
                </Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldContainer, styles.flexField]}>
                <Text style={styles.label}>Stock Actual</Text>
                <Controller
                  control={control}
                  name="stock_actual"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={String(value)}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textMuted}
                      style={[
                        styles.input,
                        errors.stock_actual && styles.inputError,
                      ]}
                    />
                  )}
                />
                {errors.stock_actual && (
                  <Text style={styles.errorText}>
                    {errors.stock_actual.message}
                  </Text>
                )}
              </View>

              <View style={[styles.fieldContainer, styles.flexField]}>
                <Text style={styles.label}>Stock Mínimo</Text>
                <Controller
                  control={control}
                  name="stock_minimo"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={String(value)}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textMuted}
                      style={[
                        styles.input,
                        errors.stock_minimo && styles.inputError,
                      ]}
                    />
                  )}
                />
                {errors.stock_minimo && (
                  <Text style={styles.errorText}>
                    {errors.stock_minimo.message}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {insumoExistente ? "Actualizar Insumo" : "Guardar Insumo"}
                </Text>
              )}
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
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  unitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  unitChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    minHeight: 44,
    justifyContent: "center",
  },
  unitChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  unitChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  unitChipTextActive: {
    color: theme.colors.primaryDark,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  flexField: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.md,
    minHeight: 50,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
});
