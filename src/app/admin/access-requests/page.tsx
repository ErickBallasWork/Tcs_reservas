import { AppShell } from '@/components/layout/AppShell';
import { AccessRequestsView } from '@/features/access-requests/AccessRequestsView';

export default function AccessRequestsPage() {
  return (
    <AppShell title="Solicitudes de acceso" mobileTitle="Accesos">
      <AccessRequestsView />
    </AppShell>
  );
}
