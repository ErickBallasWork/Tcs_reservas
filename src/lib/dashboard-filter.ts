import type { ReservationPurpose, ReservationStatus } from '@/api/types';
import { addDaysToDate, dayRange, todayLocal } from '@/lib/booking-time';

export const DASHBOARD_PAGE_SIZE = 10;
export const DASHBOARD_REFRESH_MS = 20_000;
const DEFAULT_RANGE_DAYS = 30;

export interface DashboardFilter {
  from: string;
  to: string;
  status: ReservationStatus | '';
  purpose: ReservationPurpose | '';
  page: number;
}

export interface DashboardRangeQuery {
  from?: string;
  to?: string;
}

export interface DashboardHistoryQuery extends DashboardRangeQuery {
  status?: ReservationStatus;
  purpose?: ReservationPurpose;
  page: number;
  pageSize: number;
}

export function defaultDashboardFilter(now: Date = new Date()): DashboardFilter {
  const today = todayLocal(now);
  return {
    from: addDaysToDate(today, -DEFAULT_RANGE_DAYS),
    to: today,
    status: '',
    purpose: '',
    page: 1,
  };
}

export function hasValidRange(filter: Pick<DashboardFilter, 'from' | 'to'>): boolean {
  return !filter.from || !filter.to || filter.from <= filter.to;
}

export function toRangeQuery(filter: Pick<DashboardFilter, 'from' | 'to'>): DashboardRangeQuery {
  return {
    ...(filter.from ? { from: dayRange(filter.from).from } : {}),
    ...(filter.to ? { to: dayRange(filter.to).to } : {}),
  };
}

export function toHistoryQuery(filter: DashboardFilter): DashboardHistoryQuery {
  return {
    ...toRangeQuery(filter),
    ...(filter.status ? { status: filter.status } : {}),
    ...(filter.purpose ? { purpose: filter.purpose } : {}),
    page: filter.page,
    pageSize: DASHBOARD_PAGE_SIZE,
  };
}
