import type {
  CreateReservationBody,
  CreateSeriesBody,
  RecurrenceBody,
  Reservation,
  ReservationPurpose,
  ResourceType,
  UpdateReservationBody,
} from '@/api/types';
import { parseAttendees } from '@/lib/booking-checks';
import { addDaysToDate, toInstant, toLocal, weekdayOf } from '@/lib/booking-time';

export interface RepeatValues {
  enabled: boolean;
  intervalWeeks: number;
  weekdays: number[];
  limit: 'count' | 'until';
  occurrenceCount: number;
  until: string;
}

export interface BookingFormValues {
  resourceId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  purpose: ReservationPurpose | '';
  detail: string;
  attendees: string;
  repeat: RepeatValues;
}

export interface BookingInitial {
  resourceId?: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const REPEAT_COUNT_OPTIONS = [2, 3, 4, 6, 8, 10, 12];
export const REPEAT_INTERVAL_OPTIONS = [1, 2, 3, 4];

function defaultRepeat(startDate: string): RepeatValues {
  return {
    enabled: false,
    intervalWeeks: 1,
    weekdays: [weekdayOf(startDate)],
    limit: 'count',
    occurrenceCount: 4,
    until: addDaysToDate(startDate, 28),
  };
}

export function initialValues(
  initial: BookingInitial,
  fallbackResourceId: string,
): BookingFormValues {
  return {
    resourceId: initial.resourceId ?? fallbackResourceId,
    startDate: initial.date,
    startTime: initial.startTime,
    endDate: initial.date,
    endTime: initial.endTime,
    purpose: '',
    detail: '',
    attendees: '',
    repeat: defaultRepeat(initial.date),
  };
}

export function valuesFromReservation(reservation: Reservation): BookingFormValues {
  const start = toLocal(reservation.startDateTime);
  const end = toLocal(reservation.endDateTime);
  return {
    resourceId: reservation.resourceId,
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    purpose: reservation.purpose,
    detail: reservation.justification,
    attendees: reservation.attendees === null ? '' : String(reservation.attendees),
    repeat: defaultRepeat(start.date),
  };
}

export function instantsOf(values: BookingFormValues): { start: string; end: string } {
  return {
    start: toInstant(values.startDate, values.startTime),
    end: toInstant(values.endDate, values.endTime),
  };
}

function attendeesFor(values: BookingFormValues, type: ResourceType): number | undefined {
  if (type === 'LAPTOP') return undefined;
  return parseAttendees(values.attendees) ?? undefined;
}

export function toCreateBody(
  values: BookingFormValues,
  type: ResourceType,
  purpose: ReservationPurpose,
): CreateReservationBody {
  const { start, end } = instantsOf(values);
  return {
    resourceId: values.resourceId,
    startDateTime: start,
    endDateTime: end,
    purpose,
    justification: values.detail.trim(),
    attendees: attendeesFor(values, type),
  };
}

export function toRecurrence(repeat: RepeatValues): RecurrenceBody {
  return {
    intervalWeeks: repeat.intervalWeeks,
    weekdays: [...repeat.weekdays].sort((a, b) => a - b),
    ...(repeat.limit === 'count'
      ? { occurrenceCount: repeat.occurrenceCount }
      : { until: repeat.until }),
  };
}

export function toSeriesBody(
  values: BookingFormValues,
  type: ResourceType,
  purpose: ReservationPurpose,
): CreateSeriesBody {
  return { ...toCreateBody(values, type, purpose), recurrence: toRecurrence(values.repeat) };
}

export function toUpdateBody(
  values: BookingFormValues,
  type: ResourceType,
  original: Reservation,
): UpdateReservationBody {
  const { start, end } = instantsOf(values);
  const body: UpdateReservationBody = {};
  if (values.resourceId !== original.resourceId) body.resourceId = values.resourceId;
  const slotChanged =
    new Date(start).getTime() !== new Date(original.startDateTime).getTime() ||
    new Date(end).getTime() !== new Date(original.endDateTime).getTime();
  if (slotChanged) {
    body.startDateTime = start;
    body.endDateTime = end;
  }
  if (values.purpose && values.purpose !== original.purpose) body.purpose = values.purpose;
  if (values.detail.trim() !== original.justification) body.justification = values.detail.trim();
  const attendees = attendeesFor(values, type);
  if (attendees !== undefined && attendees !== original.attendees) body.attendees = attendees;
  return body;
}

export function isSlotChange(body: UpdateReservationBody): boolean {
  return body.resourceId !== undefined || body.startDateTime !== undefined;
}

export function applyBookingPatch(
  previous: BookingFormValues,
  patch: Partial<BookingFormValues>,
): BookingFormValues {
  const merged = { ...previous, ...patch };
  if (patch.startDate === undefined || patch.startDate === previous.startDate) return merged;
  const wasSameDay = previous.endDate === previous.startDate;
  return {
    ...merged,
    endDate: wasSameDay || merged.endDate < merged.startDate ? merged.startDate : merged.endDate,
    repeat: { ...merged.repeat, weekdays: [weekdayOf(merged.startDate)] },
  };
}
