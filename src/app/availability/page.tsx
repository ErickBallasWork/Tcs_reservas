import { AppShell } from "@/components/layout/AppShell";
import { AvailabilityView } from "@/features/availability/AvailabilityView";

export default function AvailabilityPage() {
  return (
    <AppShell title="Disponibilidad">
      <AvailabilityView />
    </AppShell>
  );
}