import { describe, expect, it } from 'vitest';
import type { Reservation } from '@/api/types';
import {
  applyBookingPatch,
  initialValues,
  isSlotChange,
  toCreateBody,
  toRecurrence,
  toSeriesBody,
  toUpdateBody,
  valuesFromReservation,
  type BookingFormValues,
} from '@/lib/booking-form';

const values = (overrides: Partial<BookingFormValues> = {}): BookingFormValues => ({
  ...initialValues({ date: '2026-11-12', startTime: '10:00', endTime: '11:00' }, 'room-1'),
  purpose: 'INTERNAL_MEETING',
  detail: '  Planificación  ',
  attendees: '4',
  ...overrides,
});

const original = {
  id: 'r1',
  resourceId: 'room-1',
  purpose: 'INTERNAL_MEETING',
  justification: 'Planificación',
  attendees: 4,
  startDateTime: '2026-11-12T15:00:00.000Z',
  endDateTime: '2026-11-12T16:00:00.000Z',
} as Reservation;

describe('initialValues', () => {
  it('starts in the chosen slot with the weekday of the day selected for a series', () => {
    const initial = initialValues(
      { date: '2026-11-12', startTime: '09:00', endTime: '10:00' },
      'x',
    );

    expect(initial).toMatchObject({
      resourceId: 'x',
      startDate: '2026-11-12',
      endDate: '2026-11-12',
    });
    expect(initial.repeat).toMatchObject({ enabled: false, weekdays: [4], intervalWeeks: 1 });
  });

  it('prefers the resource of the chosen slot', () => {
    expect(
      initialValues(
        { resourceId: 'lab-1', date: '2026-11-12', startTime: '09:00', endTime: '10:00' },
        'x',
      ).resourceId,
    ).toBe('lab-1');
  });
});

describe('toCreateBody', () => {
  it('sends business time as instants and the trimmed detail', () => {
    expect(toCreateBody(values(), 'MEETING_ROOM', 'INTERNAL_MEETING')).toEqual({
      resourceId: 'room-1',
      startDateTime: '2026-11-12T15:00:00.000Z',
      endDateTime: '2026-11-12T16:00:00.000Z',
      purpose: 'INTERNAL_MEETING',
      justification: 'Planificación',
      attendees: 4,
    });
  });

  it('leaves attendees out for a laptop', () => {
    expect(toCreateBody(values(), 'LAPTOP', 'INTERNAL_MEETING').attendees).toBeUndefined();
  });

  it('supports a reservation that ends on another day', () => {
    const body = toCreateBody(
      values({ endDate: '2026-11-14', endTime: '10:00' }),
      'AI_LAB',
      'TRAINING',
    );

    expect(body.endDateTime).toBe('2026-11-14T15:00:00.000Z');
  });
});

describe('toSeriesBody', () => {
  it('adds the weekly recurrence with a count', () => {
    const body = toSeriesBody(
      values({
        repeat: { ...values().repeat, enabled: true, weekdays: [4, 2], occurrenceCount: 6 },
      }),
      'MEETING_ROOM',
      'INTERNAL_MEETING',
    );

    expect(body.recurrence).toEqual({ intervalWeeks: 1, weekdays: [2, 4], occurrenceCount: 6 });
  });

  it('uses the final date instead of the count when chosen', () => {
    const recurrence = toRecurrence({
      ...values().repeat,
      limit: 'until',
      until: '2027-01-14',
    });

    expect(recurrence).toEqual({ intervalWeeks: 1, weekdays: [4], until: '2027-01-14' });
  });
});

describe('toUpdateBody', () => {
  it('sends nothing when nothing changed', () => {
    expect(toUpdateBody(values(), 'MEETING_ROOM', original)).toEqual({});
  });

  it('sends both times together when only one moved', () => {
    const body = toUpdateBody(values({ endTime: '12:00' }), 'MEETING_ROOM', original);

    expect(body).toEqual({
      startDateTime: '2026-11-12T15:00:00.000Z',
      endDateTime: '2026-11-12T17:00:00.000Z',
    });
    expect(isSlotChange(body)).toBe(true);
  });

  it('sends only the changed detail without touching the slot', () => {
    const body = toUpdateBody(values({ detail: 'Nuevo detalle' }), 'MEETING_ROOM', original);

    expect(body).toEqual({ justification: 'Nuevo detalle' });
    expect(isSlotChange(body)).toBe(false);
  });

  it('sends the new resource, purpose and attendees', () => {
    const body = toUpdateBody(
      values({ resourceId: 'room-2', purpose: 'TRAINING', attendees: '6' }),
      'MEETING_ROOM',
      original,
    );

    expect(body).toEqual({ resourceId: 'room-2', purpose: 'TRAINING', attendees: 6 });
    expect(isSlotChange(body)).toBe(true);
  });
});

describe('valuesFromReservation', () => {
  it('reads the reservation back in business time', () => {
    expect(valuesFromReservation(original)).toMatchObject({
      resourceId: 'room-1',
      startDate: '2026-11-12',
      startTime: '10:00',
      endTime: '11:00',
      purpose: 'INTERNAL_MEETING',
      detail: 'Planificación',
      attendees: '4',
    });
  });

  it('leaves attendees empty when the reservation has none', () => {
    expect(valuesFromReservation({ ...original, attendees: null }).attendees).toBe('');
  });
});

describe('applyBookingPatch', () => {
  it('moves the end date with the start date of a same-day reservation', () => {
    const next = applyBookingPatch(values(), { startDate: '2026-11-13' });

    expect(next).toMatchObject({ startDate: '2026-11-13', endDate: '2026-11-13' });
    expect(next.repeat.weekdays).toEqual([5]);
  });

  it('keeps a later end date of a multi-day reservation', () => {
    const next = applyBookingPatch(values({ endDate: '2026-11-14' }), { startDate: '2026-11-13' });

    expect(next.endDate).toBe('2026-11-14');
  });

  it('pulls the end date forward when the start passes it', () => {
    const next = applyBookingPatch(values({ endDate: '2026-11-13' }), { startDate: '2026-11-15' });

    expect(next.endDate).toBe('2026-11-15');
  });

  it('merges any other field untouched', () => {
    const next = applyBookingPatch(values(), { resourceId: 'room-2', startTime: '12:00' });

    expect(next).toMatchObject({ resourceId: 'room-2', startTime: '12:00', endDate: '2026-11-12' });
  });
});
