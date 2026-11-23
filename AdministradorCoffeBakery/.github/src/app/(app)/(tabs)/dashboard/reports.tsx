import { SoloAdmin } from "@/components/SoloAdmin";
import { DashboardReportsScreen } from "@/features/dashboard/DashboardReportsScreen";

export default function ReportsRoute() {
  return (
    <SoloAdmin>
      <DashboardReportsScreen />
    </SoloAdmin>
  );
}
