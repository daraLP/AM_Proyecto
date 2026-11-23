import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { theme } from "../../theme/theme";
import {
  actualizarInsumo,
  crearInsumo,
  obtenerInsumo,
} from "../../services/insumos";
import { subirFotoInsumo } from "../../services/fotos";
import { useCategorias, useProveedores } from "../../hooks/useCatalogos";
import { mensajeDeError } from "@/utils/errores";
import { useToast } from "@/providers/FeedbackProvider";
import { useAvisoPermiso } from "@/hooks/useAvisoPermiso";
import { LIMITES, filtrarEntradaNumerica, normalizarTexto, validarCantidad } from "@/utils/validacion";
import { crearBloqueo } from "@/utils/envioUnico";

// Campo numérico: llega como texto; se valida (vacío, letras, negativo, decimales, tope) y sale como número
const campoCantidad = z
  .string()
  .superRefine((texto, ctx) => {
    const r = validarCantidad(texto, { permitirCero: true });
    if (!r.ok) ctx.addIssue({ code: "custom", message: r.error });
  })
  .transform((texto) => Number(texto.trim().replace(",", ".")));

const esquemaInsumo = z.object({
  nombre: z
    .string()
    .transform(normalizarTexto)
    .pipe(
      z
        .string()
        .min(2, "Escribe un nombre de al menos 2 letras")
        .max(LIMITES.nombreInsumo, `El nombre admite máximo ${LIMITES.nombreInsumo} caracteres`),
    ),
  unidad_medida: z.enum(["kg", "litros", "unidades", "cajas"], { error: "Elige una unidad de medida" }),
  stock_actual: campoCantidad,
  stock_minimo: campoCantidad,
  categoria_id: z.string().nullable(),
  proveedor_principal_id: z.string().nullable(),
});

type FormInput = z.input<typeof esquemaInsumo>;
type FormOutput = z.infer<typeof esquemaInsumo>;

const UNIDADES: {
  label: string;
  value: "kg" | "litros" | "unidades" | "cajas";
}[] = [
  { label: "Kg", value: "kg" },
  { label: "Litros", value: "litros" },
  { label: "Unidades", value: "unidades" },
  { label: "Cajas", value: "cajas" },
];

export function InsumoFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [insumoExistente, setInsumoExistente] =
    useState<Awaited<ReturnType<typeof obtenerInsumo>>["data"]>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(esquemaInsumo),
    defaultValues: {
      nombre: "",
      unidad_medida: "unidades",
      stock_actual: "0",
      stock_minimo: "0",
      categoria_id: null,
      proveedor_principal_id: null,
    },
  });
  const queryClient = useQueryClient();
  const toast = useToast();
  const avisarPermiso = useAvisoPermiso();
  const { data: categorias = [] } = useCategorias();
  const { data: proveedores = [] } = useProveedores();
  // Foto elegida en este formulario (se sube al guardar, cuando ya existe el id del insumo)
  const [fotoLocal, setFotoLocal] = useState<string | null>(null);
  const bloqueo = useRef(crearBloqueo()).current;
  // Al editar, no se puede guardar hasta que el insumo cargue (si no, se crearía uno duplicado)
  const cargandoInsumo = Boolean(id) && insumoExistente === null;

  useEffect(() => {
    if (!id) return;
    let activo = true;
    void obtenerInsumo(id).then(({ data, error }) => {
      if (!activo) return;
      if (error) {
        toast.error("No pudimos abrir el insumo", error);
        return;
      }
      setInsumoExistente(data);
      if (data) {
        setValue("nombre", data.nombre);
        setValue("unidad_medida", data.unidad_medida);
        setValue("stock_actual", String(data.stock_actual));
        setValue("stock_minimo", String(data.stock_minimo));
        setValue("categoria_id", data.categoria_id);
        setValue("proveedor_principal_id", data.proveedor_principal_id);
      }
    });
    return () => {
      activo = false;
    };
  }, [id, setValue, toast]);

  const unidadSeleccionada = watch("unidad_medida");
  const categoriaSeleccionada = watch("categoria_id");
  const proveedorSeleccionado = watch("proveedor_principal_id");

  const elegirFoto = async (origen: "camara" | "galeria") => {
    const permiso =
      origen === "camara"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      void avisarPermiso(origen);
      return;
    }
    const opciones: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };
    const resultado =
      origen === "camara"
        ? await ImagePicker.launchCameraAsync(opciones)
        : await ImagePicker.launchImageLibraryAsync(opciones);
    if (!resultado.canceled) setFotoLocal(resultado.assets[0].uri);
  };

  const onSubmit = async (valores: FormOutput) => {
    if (id && !insumoExistente) {
      toast.aviso("Espera un momento", "Todavía estamos cargando el insumo. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    const { stock_actual, ...datos } = valores;

    let idInsumo = insumoExistente?.id ?? null;
    let errorGuardado: string | null;
    if (insumoExistente) {
      ({ error: errorGuardado } = await actualizarInsumo(insumoExistente.id, datos));
    } else {
      const r = await crearInsumo(datos, stock_actual);
      idInsumo = r.id;
      errorGuardado = r.error;
    }

    // La foto se sube con el id ya conocido; un fallo aquí no deshace el guardado
    let avisoFoto: string | null = null;
    if (idInsumo && fotoLocal) {
      try {
        const url = await subirFotoInsumo(fotoLocal, idInsumo);
        const { error } = await actualizarInsumo(idInsumo, { foto_url: url });
        if (error) avisoFoto = error;
      } catch (e) {
        avisoFoto = mensajeDeError(e, "No se pudo subir la foto.");
      }
    }

    // Sin await: sin conexión la recarga queda en espera y no debe dejar el botón cargando para siempre
    void queryClient.invalidateQueries({ queryKey: ["insumos"] });
    void queryClient.invalidateQueries({ queryKey: ["insumo"] });
    void queryClient.invalidateQueries({ queryKey: ["compras"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });

    if (errorGuardado) return toast.error("No pudimos guardar el insumo", errorGuardado);
    router.back();
    if (avisoFoto) {
      toast.aviso("Insumo guardado, pero sin foto", `${avisoFoto} Puedes agregarla desde el detalle del insumo.`);
    } else {
      toast.exito(insumoExistente ? "Insumo actualizado" : "Insumo creado");
    }
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
                    maxLength={LIMITES.nombreInsumo}
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
                    disabled={Boolean(id)}
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

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Foto</Text>
              <View style={styles.fotoFila}>
                {fotoLocal ?? insumoExistente?.foto_url ? (
                  <Image
                    source={{ uri: (fotoLocal ?? insumoExistente?.foto_url) as string }}
                    style={styles.fotoPreview}
                  />
                ) : (
                  <View style={[styles.fotoPreview, styles.fotoVacia]}>
                    <Text style={styles.fotoVaciaTexto}>Sin foto</Text>
                  </View>
                )}
                <View style={styles.fotoBotones}>
                  <TouchableOpacity style={styles.unitChip} onPress={() => void elegirFoto("camara")}>
                    <Text style={styles.unitChipText}>Tomar foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.unitChip} onPress={() => void elegirFoto("galeria")}>
                    <Text style={styles.unitChipText}>Galería</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Categoría</Text>
              <View style={styles.unitsGrid}>
                <TouchableOpacity
                  style={[styles.unitChip, categoriaSeleccionada === null && styles.unitChipActive]}
                  onPress={() => setValue("categoria_id", null)}
                >
                  <Text style={[styles.unitChipText, categoriaSeleccionada === null && styles.unitChipTextActive]}>
                    Sin categoría
                  </Text>
                </TouchableOpacity>
                {categorias.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.unitChip, categoriaSeleccionada === c.id && styles.unitChipActive]}
                    onPress={() => setValue("categoria_id", c.id)}
                  >
                    <Text style={[styles.unitChipText, categoriaSeleccionada === c.id && styles.unitChipTextActive]}>
                      {c.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Proveedor principal</Text>
              <View style={styles.unitsGrid}>
                <TouchableOpacity
                  style={[styles.unitChip, proveedorSeleccionado === null && styles.unitChipActive]}
                  onPress={() => setValue("proveedor_principal_id", null)}
                >
                  <Text style={[styles.unitChipText, proveedorSeleccionado === null && styles.unitChipTextActive]}>
                    Ninguno
                  </Text>
                </TouchableOpacity>
                {proveedores.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.unitChip, proveedorSeleccionado === p.id && styles.unitChipActive]}
                    onPress={() => setValue("proveedor_principal_id", p.id)}
                  >
                    <Text style={[styles.unitChipText, proveedorSeleccionado === p.id && styles.unitChipTextActive]}>
                      {p.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldContainer, styles.flexField]}>
                <Text style={styles.label}>{id ? "Stock actual (usa el contador)" : "Stock inicial"}</Text>
                <Controller
                  control={control}
                  name="stock_actual"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={(t) => onChange(filtrarEntradaNumerica(t))}
                      editable={!id}
                      maxLength={10}
                      keyboardType="decimal-pad"
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
                      value={value}
                      onChangeText={(t) => onChange(filtrarEntradaNumerica(t))}
                      maxLength={10}
                      keyboardType="decimal-pad"
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
              style={[styles.saveButton, (isSubmitting || cargandoInsumo) && styles.buttonDisabled]}
              onPress={() => {
                bloqueo.ejecutar(() => handleSubmit(onSubmit)());
              }}
              disabled={isSubmitting || cargandoInsumo}
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
  fotoFila: { alignItems: "center", flexDirection: "row", gap: theme.spacing.md },
  fotoPreview: { borderRadius: theme.borderRadius.md, height: 88, width: 88 },
  fotoVacia: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    justifyContent: "center",
  },
  fotoVaciaTexto: { color: theme.colors.textMuted, fontSize: theme.fontSize.xs },
  fotoBotones: { flex: 1, gap: theme.spacing.sm },
});
