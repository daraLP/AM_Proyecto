import { Redirect } from "expo-router";
import { PantallaCarga } from "@/components/PantallaCarga";
import { useAuthStore } from "@/features/auth/authStore";

export default function IndexRoute() {
  const session = useAuthStore((estado) => estado.session);
  const cargando = useAuthStore((estado) => estado.cargando);

  if (cargando) return <PantallaCarga />;
  return <Redirect href={session ? "/dashboard" : "/login"} />;
}
