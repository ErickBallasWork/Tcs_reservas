'use client';

import { FeaturedNotifications } from '@/features/notifications/FeaturedNotifications';
import { NotificationInbox } from '@/features/notifications/NotificationInbox';
import { useFeaturedCards } from '@/features/notifications/useNotifications';

export function NotificationsView() {
  const featured = useFeaturedCards();
  return (
    <div className="flex flex-col gap-6">
      <FeaturedNotifications cards={featured} />
      <NotificationInbox featured={featured} />
    </div>
  );
}
