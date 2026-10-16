import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { AppState, type AppStateStatus } from "react-native";
import { supabase } from "../lib/supabaseClient";

function traducirErrorAuth(error: { message: string; code?: string }): string {
  if (error.code === "invalid_credentials") {
    return "El correo o la contraseña no son correctos.";
  }
  if (error.code === "user_already_exists") {
    return "Ya existe una cuenta con este correo.";
  }
  if (error.message.toLowerCase().includes("email not confirmed")) {
    return "Debes confirmar tu correo antes de iniciar sesión.";
  }
  return error.message;
}

export function suscribirseACambiosAuth(
  callback: (evento: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);

  const appStateSubscription = AppState.addEventListener(
    "change",
    (estado: AppStateStatus) => {
      if (estado === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    },
  );
  if (AppState.currentState === "active") {
    supabase.auth.startAutoRefresh();
  }

  return () => {
    subscription.unsubscribe();
    appStateSubscription.remove();
  };
}

export async function iniciarSesion(correo: string, contrasena: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });
  return { error: error ? traducirErrorAuth(error) : null };
}

export async function registrarse(
  correo: string,
  contrasena: string,
  nombre: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: { data: { nombre } },
  });

  return {
    error: error ? traducirErrorAuth(error) : null,
    confirmarCorreo: !error && !data.session,
  };
}

export async function cerrarSesion(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error ? traducirErrorAuth(error) : null };
}
