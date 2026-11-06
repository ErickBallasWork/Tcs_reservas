import { AppShell } from '@/components/layout/AppShell';
import { BuildingsAdminView } from '@/features/catalog/admin/BuildingsAdminView';

export default function BuildingsPage() {
  return (
    <AppShell title="Edificios" mobileTitle="Edificios">
      <BuildingsAdminView />
    </AppShell>
  );
}
