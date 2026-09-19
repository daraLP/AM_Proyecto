import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { InventarioStack } from "./InventarioStack";
import { ListaComprasScreen } from "../features/listaCompras/ListaComprasScreen";
import { PerfilScreen } from "../features/auth/PerfilScreen";

export type AppTabsParamList = {
  Dashboard: undefined;
  Inventario: undefined;
  ListaDeCompras: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen
        name="Inventario"
        component={InventarioStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="ListaDeCompras"
        component={ListaComprasScreen}
        options={{ title: "Compras" }}
      />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

// import React from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { DashboardScreen } from "../features/dashboard/DashboardScreen";
// import { InventarioStack } from "./InventarioStack";
// import { ListaComprasScreen } from "../features/listaCompras/ListaComprasScreen";
// import { PerfilScreen } from "../features/auth/PerfilScreen";
// import { theme } from "../theme/theme";

// export type AppTabsParamList = {
//   Dashboard: undefined;
//   Inventario: undefined;
//   ListaDeCompras: undefined;
//   Perfil: undefined;
// };

// const Tab = createBottomTabNavigator<AppTabsParamList>();

// export function AppTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: theme.colors.primaryDark,
//         tabBarInactiveTintColor: theme.colors.textMuted,
//         tabBarStyle: {
//           backgroundColor: theme.colors.surface,
//           borderTopColor: theme.colors.border,
//           height: 60,
//           paddingBottom: 8,
//           paddingTop: 8,
//         },
//         tabBarLabelStyle: {
//           fontSize: theme.fontSize.xs,
//           fontWeight: "600",
//         },
//       }}
//     >
//       <Tab.Screen
//         name="Dashboard"
//         component={DashboardScreen}
//         options={{ title: "Inicio" }}
//       />
//       <Tab.Screen
//         name="Inventario"
//         component={InventarioStack}
//         options={{ title: "Inventario" }}
//       />
//       <Tab.Screen
//         name="ListaDeCompras"
//         component={ListaComprasScreen}
//         options={{ title: "Compras" }}
//       />
//       <Tab.Screen
//         name="Perfil"
//         component={PerfilScreen}
//         options={{ title: "Perfil" }}
//       />
//     </Tab.Navigator>
//   );
// }
