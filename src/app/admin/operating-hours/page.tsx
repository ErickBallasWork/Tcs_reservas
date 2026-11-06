import { AppShell } from '@/components/layout/AppShell';
import { OperatingHoursView } from '@/features/operating-hours/OperatingHoursView';

export default function OperatingHoursPage() {
  return (
    <AppShell title="Horario operativo" mobileTitle="Horario">
      <OperatingHoursView />
    </AppShell>
  );
}
