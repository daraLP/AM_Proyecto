import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import type { Perfil } from "../../types/database";
import {
  cerrarSesion,
  iniciarSesion,
  registrarse,
  suscribirseACambiosAuth,
} from "../../services/auth";
import { obtenerPerfil } from "../../services/perfiles";
import { limpiarCachePersistida } from "../../lib/queryClient";

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
  // El rol lo asigna el servidor (primer usuario = administrador, resto = barista).
  registrarse: (
    correo: string,
    contrasena: string,
    nombre: string,
  ) => Promise<{ error: string | null; confirmarCorreo: boolean }>;
  cerrarSesion: () => Promise<void>;
}

let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  perfil: null,
  cargando: true,

  inicializar: () => {
    if (authSubscription) return;
    authSubscription = {
      unsubscribe: suscribirseACambiosAuth((event, session) => {
        const previousUserId = get().session?.user.id;
        set({ session });

        const userChanged =
          previousUserId !== undefined &&
          session?.user.id !== undefined &&
          previousUserId !== session.user.id;
        if (event === "SIGNED_OUT" || userChanged) {
          void limpiarCachePersistida().catch((error: unknown) => {
            console.error("Error al limpiar la caché de sesión:", error);
          });
        }

        if (!session) {
          set({ perfil: null, cargando: false });
          return;
        }
        if (get().perfil?.id === session.user.id) return;

        set({ cargando: true });
        setTimeout(() => {
          get().cargarPerfil(session.user.id);
        }, 0);
      }),
    };
  },

  cargarPerfil: async (userId) => {
    const { data, error } = await obtenerPerfil(userId);

    if (error) {
      console.error("Error al cargar el perfil:", error);
      set({ perfil: null, cargando: false });
      return;
    }
    if (!data) console.warn("No existe un perfil para este usuario.");
    set({ perfil: data, cargando: false });
  },

  iniciarSesion: async (correo, contrasena) =>
    iniciarSesion(correo, contrasena),

  registrarse: async (correo, contrasena, nombre) =>
    registrarse(correo, contrasena, nombre),

  cerrarSesion: async () => {
    const { error } = await cerrarSesion();
    if (error) {
      console.error("Error al cerrar sesión:", error);
      return;
    }
    set({ session: null, perfil: null });
  },
}));

export const useEsAdmin = () =>
  useAuthStore((e) => e.perfil?.rol === "administrador");
