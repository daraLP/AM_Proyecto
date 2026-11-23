import { SoloAdmin } from "@/components/SoloAdmin";
import { CategoriasScreen } from "@/features/auth/CategoriasScreen";

export default function CategoriasRoute() {
  return (
    <SoloAdmin>
      <CategoriasScreen />
    </SoloAdmin>
  );
}
