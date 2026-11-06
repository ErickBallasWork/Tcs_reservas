import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics, fetchDashboardReservations } from '@/features/dashboard/api';
import {
  DASHBOARD_REFRESH_MS,
  toHistoryQuery,
  toRangeQuery,
  type DashboardFilter,
} from '@/lib/dashboard-filter';

export const dashboardKeys = {
  reservations: (query: ReturnType<typeof toHistoryQuery>) =>
    ['dashboard', 'reservations', query] as const,
  metrics: (query: ReturnType<typeof toRangeQuery>) => ['dashboard', 'metrics', query] as const,
};

export function useDashboardReservations(filter: DashboardFilter, enabled: boolean) {
  const query = toHistoryQuery(filter);
  return useQuery({
    queryKey: dashboardKeys.reservations(query),
    queryFn: ({ client, queryKey }) =>
      fetchDashboardReservations(query, client.getQueryData(queryKey) !== undefined),
    placeholderData: keepPreviousData,
    refetchInterval: DASHBOARD_REFRESH_MS,
    enabled,
  });
}

export function useDashboardMetrics(filter: DashboardFilter, enabled: boolean) {
  const query = toRangeQuery(filter);
  return useQuery({
    queryKey: dashboardKeys.metrics(query),
    queryFn: () => fetchDashboardMetrics(query),
    placeholderData: keepPreviousData,
    refetchInterval: DASHBOARD_REFRESH_MS,
    enabled,
  });
}
