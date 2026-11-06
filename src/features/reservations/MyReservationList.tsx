'use client';

import { useMemo, useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { Reservation } from '@/api/types';
import { BookingDialog } from '@/features/booking/BookingDialog';
import { CancelReservationDialog } from '@/features/reservations/CancelReservationDialog';
import { ReservationItem } from '@/features/reservations/ReservationItem';
import { useMyReservations } from '@/features/reservations/useReservations';
import { toLocal } from '@/lib/booking-time';
import { myReservationsLabels as labels } from '@/lib/labels';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

type Scope = 'upcoming' | 'past';

export function MyReservationsList() {
  const [scope, setScope] = useState<Scope>('upcoming');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState<Reservation | null>(null);
  const [now] = useState(() => new Date().toISOString());

  const filter = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(scope === 'upcoming' ? { from: now } : { to: now }),
    }),
    [page, scope, now],
  );
  const reservations = useMyReservations(filter);

  const changeScope = (next: Scope) => {
    setScope(next);
    setPage(1);
  };

  const data = reservations.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const hasPendingTraining = data?.items.some(
    (item) => item.purpose === 'TRAINING' && item.status === 'PENDING_APPROVAL',
  );

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" className="flex gap-2">
        {(['upcoming', 'past'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={scope === value}
            onClick={() => changeScope(value)}
            className={cn(
              'min-h-11 flex-1 rounded-[10px] border border-line px-4 text-sm font-bold md:flex-none',
              scope === value ? 'bg-brand text-white' : 'bg-white text-brand hover:bg-soft',
            )}
          >
            {labels.tabs[value]}
          </button>
        ))}
      </div>

      {hasPendingTraining && (
        <div className="panel border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900 md:text-sm">
          {labels.pendingTraining}
        </div>
      )}

      {reservations.isPending && (
        <p role="status" className="flex items-center gap-2">
          <span className="spinner" aria-hidden />
          {labels.loading}
        </p>
      )}

      {reservations.isError && (
        <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
          <span>{messageForError(reservations.error)}</span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void reservations.refetch()}
          >
            {labels.retry}
          </button>
        </div>
      )}

      {data && data.items.length === 0 && <p className="text-ink-soft">{labels.empty[scope]}</p>}

      {data && data.items.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.items.map((item) => (
            <ReservationItem
              key={item.id}
              reservation={item}
              onEdit={setEditing}
              onCancel={setCancelling}
            />
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

      {editing && (
        <BookingDialog
          reservation={editing}
          initial={{
            date: toLocal(editing.startDateTime).date,
            startTime: toLocal(editing.startDateTime).time,
            endTime: toLocal(editing.endDateTime).time,
          }}
          onClose={() => setEditing(null)}
        />
      )}
      {cancelling && (
        <CancelReservationDialog reservation={cancelling} onClose={() => setCancelling(null)} />
      )}
    </div>
  );
}
