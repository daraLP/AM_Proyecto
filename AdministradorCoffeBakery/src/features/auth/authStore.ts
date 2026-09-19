import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";
import type { Perfil, Rol } from "../../types/database";

interface AuthState {
  session: Session | null;
  perfil: Perfil | null;
  cargando: boolean;
  inicializar: () => void;
  cargarPerfil: (userId: string) => Promise<void>;
  iniciarSesion: (
    correo: string,
    contrasena: string,
  ) => Promise<{ error: string | null }>;
  registrarse: (
    correo: string,
    contrasena: string,
    nombre: string,
    rol: Rol,
  ) => Promise<{ error: string | null }>;
  cerrarSesion: () => Promise<void>;
}
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  perfil: null,
  cargando: true,

  inicializar: () => {
    if (authSubscription) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session });

      if (session) {
        await get().cargarPerfil(session.user.id);
      } else {
        set({ perfil: null, cargando: false });
      }
    });

    authSubscription = subscription;
  },
  cargarPerfil: async (userId: string) => {
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error al cargar el perfil:", error.message);
      set({ perfil: null, cargando: false });
      return;
    }

    if (!data) {
      console.warn(
        "No existe un perfil para este usuario. Revisa el registro.",
      );
    }

    set({ perfil: data as Perfil | null, cargando: false });
  },

  iniciarSesion: async (correo, contrasena) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });
    return { error: error ? error.message : null };
  },

  registrarse: async (correo, contrasena, nombre, rol) => {
    const { error } = await supabase.auth.signUp({
      email: correo,
      password: contrasena,
      options: {
        data: { nombre, rol },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  },

  cerrarSesion: async () => {
    await supabase.auth.signOut();
    set({ session: null, perfil: null });
  },
}));
