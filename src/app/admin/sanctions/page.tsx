import { AppShell } from '@/components/layout/AppShell';
import { SanctionsView } from '@/features/sanctions/SanctionsView';

export default function SanctionsPage() {
  return (
    <AppShell title="Sanciones" mobileTitle="Sanciones">
      <SanctionsView />
    </AppShell>
  );
}
