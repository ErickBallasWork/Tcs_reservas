import type { Reservation, ReservationStatus } from '@/api/types';
import { MIN_ADVANCE_HOURS } from '@/lib/booking-checks';
import { msUntil } from '@/lib/booking-time';

const OPEN_STATUSES: readonly ReservationStatus[] = ['PENDING_APPROVAL', 'CONFIRMED'];

type ActionTarget = Pick<Reservation, 'status' | 'startDateTime'>;

export function canEditReservation(reservation: ActionTarget, now: Date = new Date()): boolean {
  return OPEN_STATUSES.includes(reservation.status) && msUntil(reservation.startDateTime, now) > 0;
}

export function canCancelReservation(reservation: ActionTarget, now: Date = new Date()): boolean {
  return (
    OPEN_STATUSES.includes(reservation.status) &&
    msUntil(reservation.startDateTime, now) >= MIN_ADVANCE_HOURS * 3_600_000
  );
}

export function seriesPosition(
  reservation: Pick<Reservation, 'series' | 'occurrenceIndex'>,
): { index: number; total: number } | null {
  if (!reservation.series || reservation.occurrenceIndex === null) return null;
  return { index: reservation.occurrenceIndex, total: reservation.series.occurrenceCount };
}
