import { describe, expect, it } from 'vitest';
import type { AgendaReservation } from '@/api/types';
import {
  checkReallocation,
  initialReallocationValues,
  toReallocateBody,
  type ReallocationValues,
} from '@/lib/reallocation-form';

const reservation: Pick<
  AgendaReservation,
  'resourceId' | 'startDateTime' | 'endDateTime' | 'attendees'
> = {
  resourceId: 'room-a',
  startDateTime: '2026-11-12T15:00:00.000Z',
  endDateTime: '2026-11-12T16:00:00.000Z',
  attendees: 6,
};

const room = { id: 'room-b', name: 'Sala B', capacity: 8 };

function values(overrides: Partial<ReallocationValues> = {}): ReallocationValues {
  return {
    ...initialReallocationValues(reservation),
    justification: 'Visita de cliente',
    ...overrides,
  };
}

describe('initialReallocationValues', () => {
  it('starts from the current room and schedule in local time', () => {
    expect(initialReallocationValues(reservation)).toEqual({
      roomId: 'room-a',
      startDate: '2026-11-12',
      startTime: '10:00',
      endDate: '2026-11-12',
      endTime: '11:00',
      justification: '',
    });
  });
});

describe('checkReallocation', () => {
  it('accepts a room change with a reason', () => {
    expect(checkReallocation(values({ roomId: 'room-b' }), reservation, room)).toBeNull();
  });

  it('requires a reason', () => {
    const problem = checkReallocation(
      values({ roomId: 'room-b', justification: '   ' }),
      reservation,
      room,
    );

    expect(problem).toBe('JUSTIFICATION_REQUIRED');
  });

  it('limits the reason to 1000 characters', () => {
    const problem = checkReallocation(
      values({ roomId: 'room-b', justification: 'x'.repeat(1001) }),
      reservation,
      room,
    );

    expect(problem).toBe('JUSTIFICATION_TOO_LONG');
  });

  it('rejects an end that is not after the start', () => {
    expect(checkReallocation(values({ endTime: '10:00' }), reservation, room)).toBe(
      'END_NOT_AFTER_START',
    );
  });

  it('rejects a room too small for the attendees', () => {
    const small = { id: 'room-c', name: 'Sala C', capacity: 4 };

    expect(checkReallocation(values({ roomId: 'room-c' }), reservation, small)).toBe(
      'ATTENDEES_EXCEED_CAPACITY',
    );
  });

  it('does not check the capacity when the reservation has no attendee count', () => {
    const small = { id: 'room-c', name: 'Sala C', capacity: 1 };

    expect(
      checkReallocation(values({ roomId: 'room-c' }), { ...reservation, attendees: null }, small),
    ).toBeNull();
  });

  it('rejects a request that changes nothing', () => {
    expect(checkReallocation(values(), reservation, room)).toBe('NOTHING_TO_CHANGE');
  });
});

describe('toReallocateBody', () => {
  it('sends only the new room when the schedule is unchanged', () => {
    expect(toReallocateBody(values({ roomId: 'room-b' }), reservation)).toEqual({
      newResourceId: 'room-b',
      justification: 'Visita de cliente',
    });
  });

  it('sends only the changed end of the schedule', () => {
    expect(toReallocateBody(values({ endTime: '12:00' }), reservation)).toEqual({
      newEndDateTime: '2026-11-12T17:00:00.000Z',
      justification: 'Visita de cliente',
    });
  });

  it('sends the room and the whole new schedule when both change', () => {
    expect(
      toReallocateBody(
        values({ roomId: 'room-b', startTime: '14:00', endTime: '15:30' }),
        reservation,
      ),
    ).toEqual({
      newResourceId: 'room-b',
      newStartDateTime: '2026-11-12T19:00:00.000Z',
      newEndDateTime: '2026-11-12T20:30:00.000Z',
      justification: 'Visita de cliente',
    });
  });

  it('trims the reason', () => {
    const body = toReallocateBody(
      values({ roomId: 'room-b', justification: '  Visita  ' }),
      reservation,
    );

    expect(body.justification).toBe('Visita');
  });
});
