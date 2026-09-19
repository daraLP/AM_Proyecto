import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "./authStore";
import type { Rol } from "../../types/database";

const esquemaRegistro = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre completo"),
  correo: z.email({ error: "Correo inválido" }),
  contrasena: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type FormInput = z.input<typeof esquemaRegistro>;
type FormOutput = z.infer<typeof esquemaRegistro>;

export function RegisterScreen() {
  const registrarse = useAuthStore((estado) => estado.registrarse);
  const [rol, setRol] = useState<Rol>("barista");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: {
      nombre: "",
      correo: "",
      contrasena: "",
    },
  });

  const onSubmit = async (valores: FormOutput) => {
    const { error } = await registrarse(
      valores.correo,
      valores.contrasena,
      valores.nombre,
      rol,
    );
    if (error) {
      Alert.alert("Error al registrarse", error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Crear cuenta
      </Text>

      <Text>Nombre</Text>
      <Controller
        control={control}
        name="nombre"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            style={{
              borderWidth: 1,
              padding: 10,
              marginBottom: 4,
              borderRadius: 6,
            }}
          />
        )}
      />
      {errors.nombre && (
        <Text style={{ color: "red" }}>{errors.nombre.message}</Text>
      )}

      <Text style={{ marginTop: 12 }}>Correo</Text>
      <Controller
        control={control}
        name="correo"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              borderWidth: 1,
              padding: 10,
              marginBottom: 4,
              borderRadius: 6,
            }}
          />
        )}
      />
      {errors.correo && (
        <Text style={{ color: "red" }}>{errors.correo.message}</Text>
      )}

      <Text style={{ marginTop: 12 }}>Contraseña</Text>
      <Controller
        control={control}
        name="contrasena"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            secureTextEntry
            style={{
              borderWidth: 1,
              padding: 10,
              marginBottom: 4,
              borderRadius: 6,
            }}
          />
        )}
      />
      {errors.contrasena && (
        <Text style={{ color: "red" }}>{errors.contrasena.message}</Text>
      )}

      <Text style={{ marginTop: 16, marginBottom: 8 }}>Rol</Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Button
          title="Barista"
          onPress={() => setRol("barista")}
          color={rol === "barista" ? "#4a3728" : "#999"}
        />
        <Button
          title="Administrador"
          onPress={() => setRol("administrador")}
          color={rol === "administrador" ? "#4a3728" : "#999"}
        />
      </View>

      <View style={{ marginTop: 24 }}>
        <Button
          title={isSubmitting ? "Creando cuenta..." : "Registrarse"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
}
