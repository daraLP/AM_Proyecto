import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RegisterScreen } from "../features/auth/RegisterScreen";
import { LoginScreen } from "../features/auth/LoginScreen";

export type AuthStackParamList = {
  Login: undefined;
  Registro: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registro" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
