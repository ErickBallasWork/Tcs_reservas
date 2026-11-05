import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { NotificationsList } from "@/features/notifications/NotificationsList";

export default function NotificationsPage() {
  return (
    <AppShell title="Notificaciones y uso">
      <Suspense fallback={null}>
        <NotificationsList />
      </Suspense>
    </AppShell>
  );
}