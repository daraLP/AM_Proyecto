// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { InventarioListScreen } from "../features/insumos/InventarioListScreen";
// import { InsumoFormScreen } from "../features/insumos/InsumoFormScreen";
// import type { Insumo } from "../types/database";

// export type InventarioStackParamList = {
//   InventarioList: undefined;
//   InsumoForm: { insumo?: Insumo } | undefined;
// };

// const Stack = createNativeStackNavigator<InventarioStackParamList>();

// export function InventarioStack() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name="InventarioList"
//         component={InventarioListScreen}
//         options={{ title: "Inventario" }}
//       />
//       <Stack.Screen
//         name="InsumoForm"
//         component={InsumoFormScreen}
//         options={{ title: "Insumo" }}
//       />
//     </Stack.Navigator>
//   );
// }
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { InventarioListScreen } from "../features/insumos/InventarioListScreen";
import { InsumoFormScreen } from "../features/insumos/InsumoFormScreen";
import type { Insumo } from "../types/database";
import { theme } from "../theme/theme";

export type InventarioStackParamList = {
  InventarioList: undefined;
  InsumoForm: { insumo?: Insumo } | undefined;
};

const Stack = createNativeStackNavigator<InventarioStackParamList>();

export function InventarioStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: {
          color: theme.colors.textPrimary,
          fontSize: theme.fontSize.md,
          fontWeight: "700",
        },
        headerTintColor: theme.colors.primaryDark,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="InventarioList"
        component={InventarioListScreen}
        options={{ title: "Inventario" }}
      />
      <Stack.Screen
        name="InsumoForm"
        component={InsumoFormScreen}
        options={({ route }) => ({
          title: route.params?.insumo ? "Editar Insumo" : "Nuevo Insumo",
        })}
      />
    </Stack.Navigator>
  );
}
