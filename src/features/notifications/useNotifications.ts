import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import {
  fetchActiveReservations,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/notifications/api';
import { useAuth } from '@/lib/auth';
import { featuredCards } from '@/lib/notification-cards';
import { useNow } from '@/lib/useNow';

export const NOTIFICATIONS_POLL_MS = 20_000;
const LIST_SAFETY_POLL_MS = 60_000;
const CLOCK_TICK_MS = 15_000;

export const notificationKeys = {
  all: ['notifications'] as const,
  unread: ['notifications', 'unread'] as const,
  lists: ['notifications', 'list'] as const,
  list: (unreadOnly: boolean, page: number) => ['notifications', 'list', unreadOnly, page] as const,
  active: ['reservations', 'active'] as const,
};

function useIsAuthenticated(): boolean {
  return useAuth().status === 'authenticated';
}

export function useUnreadCount(): number {
  const authenticated = useIsAuthenticated();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: notificationKeys.unread,
    queryFn: fetchUnreadCount,
    enabled: authenticated,
    refetchInterval: NOTIFICATIONS_POLL_MS,
  });

  const previous = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (data === undefined) return;
    if (previous.current !== undefined && previous.current !== data) {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.lists });
    }
    previous.current = data;
  }, [data, queryClient]);

  return data ?? 0;
}

export function useNotificationList(unreadOnly: boolean, page: number) {
  const authenticated = useIsAuthenticated();
  return useQuery({
    queryKey: notificationKeys.list(unreadOnly, page),
    queryFn: () => fetchNotifications(unreadOnly, page),
    enabled: authenticated,
    refetchInterval: LIST_SAFETY_POLL_MS,
    placeholderData: keepPreviousData,
  });
}

function useRefreshNotifications() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: notificationKeys.all });
}

export function useMarkRead() {
  const refresh = useRefreshNotifications();
  return useMutation({ mutationFn: (id: string) => markNotificationRead(id), onSettled: refresh });
}

export function useMarkAllRead() {
  const refresh = useRefreshNotifications();
  return useMutation({ mutationFn: markAllNotificationsRead, onSettled: refresh });
}

export function useFeaturedCards() {
  const authenticated = useIsAuthenticated();
  const now = useNow(CLOCK_TICK_MS);
  const { data } = useQuery({
    queryKey: notificationKeys.active,
    queryFn: () => fetchActiveReservations(),
    enabled: authenticated,
    refetchInterval: NOTIFICATIONS_POLL_MS,
  });
  return useMemo(() => featuredCards(data ?? [], now), [data, now]);
}
