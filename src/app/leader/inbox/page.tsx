import { AppShell } from '@/components/layout/AppShell';
import { ApprovalsInboxView } from '@/features/approvals/ApprovalsInboxView';

export default function LeaderInboxPage() {
  return (
    <AppShell title="Bandeja de entrenamientos" mobileTitle="Bandeja">
      <ApprovalsInboxView />
    </AppShell>
  );
}
