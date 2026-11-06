import type { Reservation } from '@/api/types';

export const CHECKIN_BEFORE_MIN = 15;
export const CHECKIN_AFTER_MIN = 15;
export const CHECKIN_HINT_HOURS = 24;

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

type CheckInTarget = Pick<Reservation, 'status' | 'startDateTime'>;

export type CheckInState =
  { kind: 'NOT_APPLICABLE' } | { kind: 'TOO_EARLY'; opensAt: Date } | { kind: 'OPEN' };

export function checkInState(reservation: CheckInTarget, now: Date = new Date()): CheckInState {
  if (reservation.status !== 'CONFIRMED') return { kind: 'NOT_APPLICABLE' };
  const start = new Date(reservation.startDateTime).getTime();
  const opensAt = start - CHECKIN_BEFORE_MIN * MINUTE_MS;
  const closesAt = start + CHECKIN_AFTER_MIN * MINUTE_MS;
  const t = now.getTime();
  if (t > closesAt) return { kind: 'NOT_APPLICABLE' };
  if (t >= opensAt) return { kind: 'OPEN' };
  if (opensAt - t > CHECKIN_HINT_HOURS * HOUR_MS) return { kind: 'NOT_APPLICABLE' };
  return { kind: 'TOO_EARLY', opensAt: new Date(opensAt) };
}

export function upcomingBoundary(now: Date = new Date()): Date {
  return new Date(now.getTime() - CHECKIN_AFTER_MIN * MINUTE_MS);
}
