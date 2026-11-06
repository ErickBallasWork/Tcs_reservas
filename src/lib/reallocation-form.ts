import type { AgendaReservation, AgendaRoom, ReallocateBody } from '@/api/types';
import { toInstant, toLocal } from '@/lib/booking-time';

export const MAX_JUSTIFICATION_LENGTH = 1000;

export interface ReallocationValues {
  roomId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  justification: string;
}

export type ReallocationProblem =
  | 'JUSTIFICATION_REQUIRED'
  | 'JUSTIFICATION_TOO_LONG'
  | 'END_NOT_AFTER_START'
  | 'ATTENDEES_EXCEED_CAPACITY'
  | 'NOTHING_TO_CHANGE';

type MovableReservation = Pick<
  AgendaReservation,
  'resourceId' | 'startDateTime' | 'endDateTime' | 'attendees'
>;

export function initialReallocationValues(reservation: MovableReservation): ReallocationValues {
  const start = toLocal(reservation.startDateTime);
  const end = toLocal(reservation.endDateTime);
  return {
    roomId: reservation.resourceId,
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    justification: '',
  };
}

export function instantsOfReallocation(values: ReallocationValues): { start: string; end: string } {
  return {
    start: toInstant(values.startDate, values.startTime),
    end: toInstant(values.endDate, values.endTime),
  };
}

const sameInstant = (a: string, b: string) => new Date(a).getTime() === new Date(b).getTime();

function changesOf(values: ReallocationValues, reservation: MovableReservation) {
  const { start, end } = instantsOfReallocation(values);
  return {
    room: values.roomId !== reservation.resourceId,
    start: !sameInstant(start, reservation.startDateTime),
    end: !sameInstant(end, reservation.endDateTime),
  };
}

export function checkReallocation(
  values: ReallocationValues,
  reservation: MovableReservation,
  room: AgendaRoom | undefined,
): ReallocationProblem | null {
  const { start, end } = instantsOfReallocation(values);
  if (new Date(end).getTime() <= new Date(start).getTime()) return 'END_NOT_AFTER_START';
  if (room && reservation.attendees !== null && reservation.attendees > room.capacity) {
    return 'ATTENDEES_EXCEED_CAPACITY';
  }
  const changes = changesOf(values, reservation);
  if (!changes.room && !changes.start && !changes.end) return 'NOTHING_TO_CHANGE';
  const justification = values.justification.trim();
  if (justification.length === 0) return 'JUSTIFICATION_REQUIRED';
  if (justification.length > MAX_JUSTIFICATION_LENGTH) return 'JUSTIFICATION_TOO_LONG';
  return null;
}

export function toReallocateBody(
  values: ReallocationValues,
  reservation: MovableReservation,
): ReallocateBody {
  const { start, end } = instantsOfReallocation(values);
  const changes = changesOf(values, reservation);
  return {
    justification: values.justification.trim(),
    ...(changes.room ? { newResourceId: values.roomId } : {}),
    ...(changes.start ? { newStartDateTime: start } : {}),
    ...(changes.end ? { newEndDateTime: end } : {}),
  };
}
