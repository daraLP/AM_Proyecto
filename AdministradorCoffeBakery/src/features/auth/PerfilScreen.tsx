// import React from "react";
// import { View, Text, Button } from "react-native";
// import { useAuthStore } from "./authStore";

// export function PerfilScreen() {
//   const perfil = useAuthStore((estado) => estado.perfil);
//   const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);

//   return (
//     <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
//       <Text style={{ fontSize: 20, fontWeight: "bold" }}>
//         {perfil?.nombre ?? "Usuario"}
//       </Text>
//       <Text
//         style={{ color: "#666", marginBottom: 24, textTransform: "capitalize" }}
//       >
//         {perfil?.rol}
//       </Text>
//       <Button title="Cerrar sesión" onPress={cerrarSesion} color="#b3261e" />
//     </View>
//   );
// }
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "./authStore";
import { theme } from "../../theme/theme";

export function PerfilScreen() {
  const perfil = useAuthStore((estado) => estado.perfil);
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {perfil?.nombre ? perfil.nombre.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>

          <Text
            style={styles.nombreText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {perfil?.nombre ?? "Usuario"}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {perfil?.rol ?? "Sin rol"}
            </Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={cerrarSesion}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: "center",
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  avatarInitial: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    color: theme.colors.primaryDark,
  },
  nombreText: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  badge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: "100%",
    marginBottom: theme.spacing.lg,
  },
  logoutButton: {
    backgroundColor: theme.colors.errorLight,
    paddingVertical: theme.spacing.md,
    width: "100%",
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
});
