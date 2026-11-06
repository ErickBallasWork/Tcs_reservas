import type { AgendaReservation, AgendaRoom, ReservationStatus } from '@/api/types';
import { msUntil, toLocal } from '@/lib/booking-time';

const MOVABLE_STATUSES: readonly ReservationStatus[] = ['CONFIRMED', 'PENDING_APPROVAL'];
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const DEFAULT_OPEN_MINUTE = 7 * MINUTES_PER_HOUR;
const DEFAULT_CLOSE_MINUTE = 20 * MINUTES_PER_HOUR;

export interface DayWindow {
  startMinute: number;
  endMinute: number;
}

export interface BlockPlacement {
  top: number;
  height: number;
}

export function canReallocate(
  reservation: Pick<AgendaReservation, 'status' | 'startDateTime'>,
  now: Date = new Date(),
): boolean {
  return (
    MOVABLE_STATUSES.includes(reservation.status) && msUntil(reservation.startDateTime, now) > 0
  );
}

function minuteOfDay(date: string, instant: string): number {
  const local = toLocal(instant);
  if (local.date < date) return 0;
  if (local.date > date) return MINUTES_PER_DAY;
  const [hours, minutes] = local.time.split(':').map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
}

function overlapsDay(date: string, reservation: AgendaReservation): boolean {
  return (
    toLocal(reservation.startDateTime).date <= date && toLocal(reservation.endDateTime).date >= date
  );
}

export function dayWindow(date: string, reservations: readonly AgendaReservation[]): DayWindow {
  let startMinute = DEFAULT_OPEN_MINUTE;
  let endMinute = DEFAULT_CLOSE_MINUTE;
  for (const reservation of reservations.filter((item) => overlapsDay(date, item))) {
    startMinute = Math.min(startMinute, minuteOfDay(date, reservation.startDateTime));
    endMinute = Math.max(endMinute, minuteOfDay(date, reservation.endDateTime));
  }
  return {
    startMinute: Math.floor(startMinute / MINUTES_PER_HOUR) * MINUTES_PER_HOUR,
    endMinute: Math.min(
      Math.ceil(endMinute / MINUTES_PER_HOUR) * MINUTES_PER_HOUR,
      MINUTES_PER_DAY,
    ),
  };
}

export function hourMarks(window: DayWindow): number[] {
  const marks: number[] = [];
  for (let minute = window.startMinute; minute < window.endMinute; minute += MINUTES_PER_HOUR) {
    marks.push(minute);
  }
  return marks;
}

export function formatHour(minute: number): string {
  return `${String(Math.floor(minute / MINUTES_PER_HOUR)).padStart(2, '0')}:00`;
}

export function blockPlacement(
  date: string,
  reservation: AgendaReservation,
  window: DayWindow,
): BlockPlacement | null {
  if (!overlapsDay(date, reservation)) return null;
  const span = window.endMinute - window.startMinute;
  const start = Math.max(minuteOfDay(date, reservation.startDateTime), window.startMinute);
  const end = Math.min(minuteOfDay(date, reservation.endDateTime), window.endMinute);
  if (end <= start) return null;
  return {
    top: ((start - window.startMinute) / span) * 100,
    height: ((end - start) / span) * 100,
  };
}

export function reservationsByRoom(
  reservations: readonly AgendaReservation[],
  rooms: readonly AgendaRoom[],
): Record<string, AgendaReservation[]> {
  const grouped: Record<string, AgendaReservation[]> = Object.fromEntries(
    rooms.map((room) => [room.id, []]),
  );
  for (const reservation of reservations) {
    grouped[reservation.resourceId]?.push(reservation);
  }
  return grouped;
}
