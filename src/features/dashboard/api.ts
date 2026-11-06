import { apiClient } from '@/api/api-client';
import type { DashboardMetrics, ReservationPage } from '@/api/types';
import { unwrap } from '@/api/unwrap';
import type { DashboardHistoryQuery, DashboardRangeQuery } from '@/lib/dashboard-filter';

export async function fetchDashboardReservations(
  query: DashboardHistoryQuery,
  isRefresh: boolean,
): Promise<ReservationPage> {
  return unwrap(
    await apiClient.GET('/dashboard/reservations', {
      params: { query: { ...query, ...(isRefresh ? { refresh: 'true' as const } : {}) } },
    }),
  );
}

export async function fetchDashboardMetrics(query: DashboardRangeQuery): Promise<DashboardMetrics> {
  return unwrap(await apiClient.GET('/dashboard/metrics', { params: { query } }));
}
