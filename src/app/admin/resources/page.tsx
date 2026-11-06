import { AppShell } from '@/components/layout/AppShell';
import { ResourcesAdminView } from '@/features/catalog/admin/ResourcesAdminView';

export default function ResourcesPage() {
  return (
    <AppShell title="Salas y laboratorios" mobileTitle="Salas">
      <ResourcesAdminView />
    </AppShell>
  );
}
