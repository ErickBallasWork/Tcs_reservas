import { AppShell } from "@/components/layout/AppShell";
import { NotificationsView } from "@/features/notifications/NotificationsView";

export default function NotificationsPage() {
  return (
    <AppShell title="Notificaciones y uso" mobileTitle="Notificaciones">
      <NotificationsView />
    </AppShell>
  );
}