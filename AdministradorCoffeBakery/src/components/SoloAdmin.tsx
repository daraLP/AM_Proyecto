import type { ReactNode } from "react";
import { Redirect } from "expo-router";
import { useEsAdmin } from "@/features/auth/authStore";

export function SoloAdmin({ children }: { children: ReactNode }) {
  const esAdmin = useEsAdmin();
  return esAdmin ? <>{children}</> : <Redirect href="/dashboard" />;
}
