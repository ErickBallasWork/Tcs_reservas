'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import { DashboardFilters } from '@/features/dashboard/DashboardFilters';
import { DashboardMetrics } from '@/features/dashboard/DashboardMetrics';
import { DashboardReservationItem } from '@/features/dashboard/DashboardReservationItem';
import { useDashboardMetrics, useDashboardReservations } from '@/features/dashboard/useDashboard';
import { useAuth } from '@/lib/auth';
import { toLocal } from '@/lib/booking-time';
import {
  DASHBOARD_PAGE_SIZE,
  defaultDashboardFilter,
  hasValidRange,
  type DashboardFilter,
} from '@/lib/dashboard-filter';
import { dashboardLabels as labels } from '@/lib/labels';

export function DashboardView() {
  const { roles } = useAuth();
  const [filter, setFilter] = useState<DashboardFilter>(() => defaultDashboardFilter());
  const validRange = hasValidRange(filter);
  const history = useDashboardReservations(filter, validRange);
  const metrics = useDashboardMetrics(filter, validRange);
  const error = history.error ?? metrics.error;
  const seesEveryone = roles.includes('ADMIN') || roles.includes('SUPERADMIN');
  const pages = history.data ? Math.max(1, Math.ceil(history.data.total / DASHBOARD_PAGE_SIZE)) : 1;
  const updatedAt = history.dataUpdatedAt ? toLocal(new Date(history.dataUpdatedAt)).time : null;

  const change = (changes: Partial<DashboardFilter>) =>
    setFilter((current) => ({ ...current, ...changes }));
  const refetchAll = () => void Promise.all([history.refetch(), metrics.refetch()]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink-soft">{seesEveryone ? labels.introAll : labels.intro}</p>

      <DashboardFilters filter={filter} rangeError={!validRange} onChange={change} />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-soft">
        <span role="status" aria-live="polite">
          {updatedAt ? labels.updatedAt(updatedAt) : labels.loading}
        </span>
        <button type="button" className="btn btn-outline" onClick={refetchAll}>
          {labels.refresh}
        </button>
      </div>

      {error && (
        <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
          <span>{messageForError(error)}</span>
          <button type="button" className="btn btn-outline" onClick={refetchAll}>
            {labels.retry}
          </button>
        </div>
      )}

      {metrics.data && <DashboardMetrics metrics={metrics.data} />}

      {history.data && history.data.items.length === 0 && (
        <p className="text-ink-soft">{labels.empty}</p>
      )}

      {history.data && history.data.items.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {history.data.items.map((reservation) => (
            <DashboardReservationItem key={reservation.id} reservation={reservation} />
          ))}
        </ul>
      )}

      {history.data && pages > 1 && (
        <nav
          className="flex items-center justify-between gap-2"
          aria-label={labels.pageOf(filter.page, pages)}
        >
          <button
            type="button"
            className="btn btn-outline"
            disabled={filter.page <= 1}
            onClick={() => change({ page: filter.page - 1 })}
          >
            {labels.previous}
          </button>
          <span className="text-sm">{labels.pageOf(filter.page, pages)}</span>
          <button
            type="button"
            className="btn btn-outline"
            disabled={filter.page >= pages}
            onClick={() => change({ page: filter.page + 1 })}
          >
            {labels.next}
          </button>
        </nav>
      )}
    </div>
  );
}
