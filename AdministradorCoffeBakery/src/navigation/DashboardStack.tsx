import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { DashboardReportsScreen } from "../features/dashboard/DashboardReportsScreen";
import { theme } from "../theme/theme";

export type DashboardStackParamList = {
  Dashboard: undefined;
  Reports: undefined;
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStack() {
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
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen
        name="Reports"
        component={DashboardReportsScreen}
        options={{ title: "Reporte de consumo" }}
      />
    </Stack.Navigator>
  );
}
