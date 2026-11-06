import { AppShell } from '@/components/layout/AppShell';
import { SpocAgendaView } from '@/features/spoc-agenda/SpocAgendaView';
import { spocAgendaLabels as labels } from '@/lib/labels';

export default function SpocAgendaPage() {
  return (
    <AppShell title={labels.title} mobileTitle={labels.mobileTitle}>
      <SpocAgendaView />
    </AppShell>
  );
}
