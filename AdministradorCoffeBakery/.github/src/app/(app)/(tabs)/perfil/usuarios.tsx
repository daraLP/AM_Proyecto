import { SoloAdmin } from "@/components/SoloAdmin";
import { UsuariosScreen } from "@/features/auth/UsuariosScreen";

export default function UsuariosRoute() {
  return (
    <SoloAdmin>
      <UsuariosScreen />
    </SoloAdmin>
  );
}
