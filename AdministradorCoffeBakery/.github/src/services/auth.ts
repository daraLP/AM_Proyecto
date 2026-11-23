import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { AppState, type AppStateStatus } from "react-native";
import { supabase } from "../lib/supabaseClient";
import { mensajeDeError } from "../utils/errores";

function traducirErrorAuth(error: unknown): string {
  return mensajeDeError(error);
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
