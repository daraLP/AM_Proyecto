// import React, { useEffect } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { ActivityIndicator, View } from "react-native";
// import { useAuthStore } from "../features/auth/authStore";
// import { AuthStack } from "./AuthStack";
// import { AppTabs } from "./AppTabs";

// // export function RootNavigator() {
// //   const session = useAuthStore((estado) => estado.session);
// //   const cargando = useAuthStore((estado) => estado.cargando);
// //   const inicializar = useAuthStore((estado) => estado.inicializar);

// //   useEffect(() => {
// //     inicializar();
// //   }, [inicializar]);

// //   if (cargando) {
// //     return (
// //       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
// //         <ActivityIndicator size="large" />
// //       </View>
// //     );
// //   }

// //   return (
// //     <NavigationContainer>
// //       {session ? <AppTabs /> : <AuthStack />}
// //     </NavigationContainer>
// //   );
// // }

// // RootNavigator.tsx
// export function RootNavigator() {
//   const session = useAuthStore((estado) => estado.session);
//   const cargando = useAuthStore((estado) => estado.cargando);
//   const inicializar = useAuthStore((estado) => estado.inicializar);

//   useEffect(() => {
//     inicializar();
//   }, []); // Dependencias vacías para asegurar que se monte una sola vez

//   if (cargando) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       {session ? <AppTabs /> : <AuthStack />}
//     </NavigationContainer>
//   );
// }
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuthStore } from "../features/auth/authStore";
import { AuthStack } from "./AuthStack";
import { AppTabs } from "./AppTabs";
import { theme } from "../theme/theme";

export function RootNavigator() {
  const session = useAuthStore((estado) => estado.session);
  const cargando = useAuthStore((estado) => estado.cargando);
  const inicializar = useAuthStore((estado) => estado.inicializar);

  useEffect(() => {
    inicializar();
  }, []);

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
});
