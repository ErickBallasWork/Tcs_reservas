import { apiClient } from '@/api/api-client';
import type { Notification, NotificationPage, PushConfig, Reservation } from '@/api/types';
import { unwrap } from '@/api/unwrap';
import { fetchMyReservations } from '@/features/reservations/api';
import { CHECKIN_AFTER_MIN, CHECKIN_BEFORE_MIN } from '@/lib/check-in';
import { STARTS_SOON_LEAD_MIN } from '@/lib/notification-cards';

export const NOTIFICATIONS_PAGE_SIZE = 20;

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const MAX_RESERVATION_HOURS = 48;
const ACTIVE_PAGE_SIZE = 20;

export async function fetchNotifications(
  unreadOnly: boolean,
  page: number,
): Promise<NotificationPage> {
  return unwrap(
    await apiClient.GET('/notifications', {
      params: { query: { page, pageSize: NOTIFICATIONS_PAGE_SIZE, unreadOnly } },
    }),
  );
}

export async function fetchUnreadCount(): Promise<number> {
  const { unread } = unwrap(await apiClient.GET('/notifications/unread-count'));
  return unread;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return unwrap(await apiClient.PATCH('/notifications/{id}/read', { params: { path: { id } } }));
}

export async function markAllNotificationsRead(): Promise<number> {
  const { updated } = unwrap(await apiClient.PATCH('/notifications/read-all'));
  return updated;
}

export async function fetchActiveReservations(now: Date = new Date()): Promise<Reservation[]> {
  const t = now.getTime();
  const [upcoming, inUse] = await Promise.all([
    fetchMyReservations({
      page: 1,
      pageSize: ACTIVE_PAGE_SIZE,
      status: 'CONFIRMED',
      from: new Date(t - CHECKIN_AFTER_MIN * MINUTE_MS).toISOString(),
      to: new Date(
        t + Math.max(STARTS_SOON_LEAD_MIN, CHECKIN_BEFORE_MIN) * MINUTE_MS,
      ).toISOString(),
    }),
    fetchMyReservations({
      page: 1,
      pageSize: ACTIVE_PAGE_SIZE,
      status: 'CHECKED_IN',
      from: new Date(t - MAX_RESERVATION_HOURS * HOUR_MS).toISOString(),
    }),
  ]);
  return [...upcoming.items, ...inUse.items];
}

export async function fetchPushConfig(): Promise<PushConfig> {
  return unwrap(await apiClient.GET('/notifications/push-config'));
}

export async function registerPushSubscription(subscription: PushSubscriptionJSON): Promise<void> {
  const { endpoint, keys } = subscription;
  if (!endpoint || !keys?.p256dh || !keys.auth) return;
  unwrap(
    await apiClient.PUT('/notifications/push-subscription', {
      body: { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
    }),
  );
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  unwrap(await apiClient.DELETE('/notifications/push-subscription', { body: { endpoint } }));
}
