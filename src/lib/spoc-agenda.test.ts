import { describe, expect, it } from 'vitest';
import type { AgendaReservation, AgendaRoom } from '@/api/types';
import {
  blockPlacement,
  canReallocate,
  dayWindow,
  formatHour,
  hourMarks,
  reservationsByRoom,
} from '@/lib/spoc-agenda';

const DATE = '2026-11-12';

function reservation(overrides: Partial<AgendaReservation> = {}): AgendaReservation {
  return {
    id: 'res-1',
    resourceId: 'room-a',
    startDateTime: '2026-11-12T15:00:00.000Z',
    endDateTime: '2026-11-12T16:00:00.000Z',
    status: 'CONFIRMED',
    purpose: 'INTERNAL_MEETING',
    justification: 'Reunión',
    attendees: 4,
    seriesId: null,
    reallocated: false,
    owner: { fullName: 'Ana' },
    ...overrides,
  };
}

describe('canReallocate', () => {
  const now = new Date('2026-11-12T10:00:00Z');

  it('allows confirmed and pending reservations that have not started', () => {
    expect(canReallocate(reservation(), now)).toBe(true);
    expect(canReallocate(reservation({ status: 'PENDING_APPROVAL' }), now)).toBe(true);
  });

  it('does not allow a reservation that already has its usage registered', () => {
    expect(canReallocate(reservation({ status: 'CHECKED_IN' }), now)).toBe(false);
  });

  it('does not allow a reservation that already started', () => {
    expect(canReallocate(reservation(), new Date('2026-11-12T15:30:00Z'))).toBe(false);
  });

  it('does not require the 24 h advance', () => {
    expect(canReallocate(reservation(), new Date('2026-11-12T14:59:00Z'))).toBe(true);
  });
});

describe('dayWindow', () => {
  it('uses the working day when the reservations fit in it', () => {
    expect(dayWindow(DATE, [reservation()])).toEqual({ startMinute: 420, endMinute: 1200 });
  });

  it('opens the window for an early or late reservation', () => {
    const early = reservation({
      startDateTime: '2026-11-12T11:30:00.000Z',
      endDateTime: '2026-11-12T12:30:00.000Z',
    });
    const late = reservation({
      startDateTime: '2026-11-13T02:00:00.000Z',
      endDateTime: '2026-11-13T04:00:00.000Z',
    });

    expect(dayWindow(DATE, [early, late])).toEqual({ startMinute: 360, endMinute: 1380 });
  });

  it('stops at midnight for a reservation that goes on the next day', () => {
    const overnight = reservation({
      startDateTime: '2026-11-13T00:00:00.000Z',
      endDateTime: '2026-11-14T10:00:00.000Z',
    });

    expect(dayWindow(DATE, [overnight]).endMinute).toBe(1440);
  });

  it('ignores reservations of other days', () => {
    const other = reservation({
      startDateTime: '2026-11-20T11:00:00.000Z',
      endDateTime: '2026-11-20T12:00:00.000Z',
    });

    expect(dayWindow(DATE, [other])).toEqual({ startMinute: 420, endMinute: 1200 });
  });
});

describe('hourMarks and formatHour', () => {
  it('lists every full hour of the window', () => {
    expect(hourMarks({ startMinute: 420, endMinute: 600 })).toEqual([420, 480, 540]);
  });

  it('pads the hours', () => {
    expect(formatHour(420)).toBe('07:00');
    expect(formatHour(1260)).toBe('21:00');
  });
});

describe('blockPlacement', () => {
  const window = { startMinute: 420, endMinute: 1200 };

  it('places a reservation as a share of the window', () => {
    const placement = blockPlacement(DATE, reservation(), window);

    expect(placement?.top).toBeCloseTo((180 / 780) * 100);
    expect(placement?.height).toBeCloseTo((60 / 780) * 100);
  });

  it('clips a reservation that crosses midnight to the visible day', () => {
    const overnight = reservation({
      startDateTime: '2026-11-13T00:00:00.000Z',
      endDateTime: '2026-11-13T10:00:00.000Z',
    });

    const placement = blockPlacement(DATE, overnight, { startMinute: 420, endMinute: 1440 });

    expect(placement).not.toBeNull();
    expect((placement?.top ?? 0) + (placement?.height ?? 0)).toBeCloseTo(100);
  });

  it('returns nothing for a reservation of another day', () => {
    const other = reservation({
      startDateTime: '2026-11-13T15:00:00.000Z',
      endDateTime: '2026-11-13T16:00:00.000Z',
    });

    expect(blockPlacement(DATE, other, window)).toBeNull();
  });
});

describe('reservationsByRoom', () => {
  const rooms: AgendaRoom[] = [
    { id: 'room-a', name: 'Sala A', capacity: 8 },
    { id: 'room-b', name: 'Sala B', capacity: 4 },
  ];

  it('groups by room and keeps empty rooms', () => {
    const grouped = reservationsByRoom([reservation(), reservation({ id: 'res-2' })], rooms);

    expect(grouped['room-a'].map((item) => item.id)).toEqual(['res-1', 'res-2']);
    expect(grouped['room-b']).toEqual([]);
  });

  it('drops reservations of rooms that are not listed', () => {
    const grouped = reservationsByRoom([reservation({ resourceId: 'gone' })], rooms);

    expect(Object.keys(grouped)).toEqual(['room-a', 'room-b']);
  });
});
