import { AppShell } from '@/components/layout/AppShell';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { dashboardLabels as labels } from '@/lib/labels';

export default function LeaderDashboardPage() {
  return (
    <AppShell title={labels.title} mobileTitle={labels.mobileTitle}>
      <DashboardView />
    </AppShell>
  );
}
