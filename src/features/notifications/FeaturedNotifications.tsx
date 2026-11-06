import { NotificationCard } from '@/features/notifications/NotificationCard';
import { notificationsLabels as labels } from '@/lib/labels';
import type { NotificationCardModel } from '@/lib/notification-cards';

interface FeaturedNotificationsProps {
  cards: readonly NotificationCardModel[];
}

export function FeaturedNotifications({ cards }: FeaturedNotificationsProps) {
  if (cards.length === 0) return null;
  return (
    <section aria-labelledby="featured-notifications" className="flex flex-col gap-3">
      <h2 id="featured-notifications" className="text-base font-bold text-brand">
        {labels.nowHeading}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <NotificationCard key={card.key} card={card} />
        ))}
      </div>
    </section>
  );
}
