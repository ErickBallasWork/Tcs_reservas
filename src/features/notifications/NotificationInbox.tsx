'use client';

import { useMemo, useState } from 'react';
import { messageForError } from '@/api/error-messages';
import { NotificationCard } from '@/features/notifications/NotificationCard';
import { NOTIFICATIONS_PAGE_SIZE } from '@/features/notifications/api';
import {
  useMarkAllRead,
  useMarkRead,
  useNotificationList,
} from '@/features/notifications/useNotifications';
import { notificationsLabels as labels } from '@/lib/labels';
import {
  inboxCard,
  withoutFeaturedReminders,
  type NotificationCardModel,
} from '@/lib/notification-cards';
import { cn } from '@/lib/utils';

interface NotificationInboxProps {
  featured: readonly NotificationCardModel[];
}

export function NotificationInbox({ featured }: NotificationInboxProps) {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const list = useNotificationList(unreadOnly, page);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const data = list.data;
  const unread = data?.unread ?? 0;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / NOTIFICATIONS_PAGE_SIZE)) : 1;
  const cards = useMemo(
    () => (data ? withoutFeaturedReminders(data.items, featured).map(inboxCard) : []),
    [data, featured],
  );

  const changeFilter = (next: boolean) => {
    setUnreadOnly(next);
    setPage(1);
  };

  return (
    <section aria-labelledby="notification-inbox" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="notification-inbox" className="text-base font-bold text-brand">
          {labels.inboxHeading}
        </h2>
        <button
          type="button"
          className="btn btn-outline min-h-11 px-3 text-sm"
          disabled={unread === 0 || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          {labels.markAllRead}
        </button>
      </div>

      <div role="tablist" aria-label={labels.filters} className="flex gap-2">
        {([false, true] as const).map((value) => (
          <button
            key={String(value)}
            type="button"
            role="tab"
            aria-selected={unreadOnly === value}
            onClick={() => changeFilter(value)}
            className={cn(
              'min-h-11 cursor-pointer rounded-full border-[1.5px] border-brand px-4 text-sm font-semibold transition-colors',
              unreadOnly === value ? 'bg-brand text-white' : 'bg-white text-brand hover:bg-soft',
            )}
          >
            {value ? labels.unreadBadge(unread) : labels.filterAll}
          </button>
        ))}
      </div>

      {list.isPending && (
        <p role="status" className="flex items-center gap-2">
          <span className="spinner" aria-hidden />
          {labels.loading}
        </p>
      )}

      {list.isError && (
        <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
          <span>{messageForError(list.error)}</span>
          <button type="button" className="btn btn-outline" onClick={() => void list.refetch()}>
            {labels.retry}
          </button>
        </div>
      )}

      {data && cards.length === 0 && (
        <p className="text-ink-soft">{unreadOnly ? labels.emptyUnread : labels.emptyAll}</p>
      )}

      {cards.length > 0 && (
        <ul className="grid gap-3 xl:grid-cols-2">
          {cards.map((card) => (
            <li key={card.key} className="contents">
              <NotificationCard card={card} onMarkRead={(id) => markRead.mutate(id)} />
            </li>
          ))}
        </ul>
      )}

      {data && totalPages > 1 && (
        <nav className="flex items-center justify-between gap-2" aria-label={labels.pagination}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {labels.previous}
          </button>
          <span className="text-sm text-ink-soft">{labels.page(page, totalPages)}</span>
          <button
            type="button"
            className="btn btn-outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            {labels.next}
          </button>
        </nav>
      )}
    </section>
  );
}
