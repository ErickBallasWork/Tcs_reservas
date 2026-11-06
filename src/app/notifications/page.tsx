import { AppShell } from '@/components/layout/AppShell';
import { NotificationsView } from '@/features/notifications/NotificationsView';

export default function NotificationsPage() {
  return (
    <AppShell title="Notificaciones" mobileTitle="Notificaciones">
      <NotificationsView />
    </AppShell>
  );
}
