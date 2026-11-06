import { describe, expect, it } from 'vitest';
import type { Reservation, ReservationReallocation } from '@/api/types';
import {
  canCancelReservation,
  canEditReservation,
  seriesPosition,
  wasReallocated,
} from '@/lib/reservation-actions';

const NOW = new Date('2026-11-06T12:00:00Z');
const at = (hours: number) => new Date(NOW.getTime() + hours * 3_600_000).toISOString();

describe('canCancelReservation', () => {
  it('needs 24 h of advance, limit included', () => {
    expect(canCancelReservation({ status: 'CONFIRMED', startDateTime: at(24) }, NOW)).toBe(true);
    expect(canCancelReservation({ status: 'CONFIRMED', startDateTime: at(23.5) }, NOW)).toBe(false);
  });

  it('only applies to confirmed and pending reservations', () => {
    expect(canCancelReservation({ status: 'PENDING_APPROVAL', startDateTime: at(48) }, NOW)).toBe(
      true,
    );
    for (const status of ['REJECTED', 'CANCELLED', 'CHECKED_IN', 'NO_SHOW'] as const) {
      expect(canCancelReservation({ status, startDateTime: at(48) }, NOW)).toBe(false);
    }
  });
});

const resource = {
  id: 'room',
  name: 'Sala',
  type: 'MEETING_ROOM' as const,
  building: { id: 'b', name: 'Edificio' },
  parent: null,
};
const reallocation: ReservationReallocation = {
  id: 'r1',
  reservationId: 'res',
  previousResourceId: 'room',
  newResourceId: 'room-2',
  responsibleUserId: 'spoc',
  previousStartDateTime: at(30),
  previousEndDateTime: at(31),
  newStartDateTime: at(2),
  newEndDateTime: at(3),
  justification: 'Visita de cliente',
  reallocationDate: NOW.toISOString(),
  previousResource: resource,
  newResource: resource,
};

describe('canCancelReservation after a reallocation', () => {
  it('waives the 24 h advance', () => {
    const moved = {
      status: 'CONFIRMED' as const,
      startDateTime: at(2),
      reallocations: [reallocation],
    };

    expect(canCancelReservation(moved, NOW)).toBe(true);
    expect(wasReallocated(moved)).toBe(true);
  });

  it('closes once the reservation starts', () => {
    const started = {
      status: 'CONFIRMED' as const,
      startDateTime: at(-1),
      reallocations: [reallocation],
    };

    expect(canCancelReservation(started, NOW)).toBe(false);
  });

  it('keeps the 24 h advance for a reservation that was never moved', () => {
    const plain = { status: 'CONFIRMED' as const, startDateTime: at(2), reallocations: [] };

    expect(canCancelReservation(plain, NOW)).toBe(false);
    expect(wasReallocated(plain)).toBe(false);
  });
});

describe('canEditReservation', () => {
  it('stays open until the reservation starts', () => {
    expect(canEditReservation({ status: 'CONFIRMED', startDateTime: at(1) }, NOW)).toBe(true);
    expect(canEditReservation({ status: 'CONFIRMED', startDateTime: at(-1) }, NOW)).toBe(false);
  });

  it('is closed for finished reservations', () => {
    expect(canEditReservation({ status: 'CANCELLED', startDateTime: at(48) }, NOW)).toBe(false);
    expect(canEditReservation({ status: 'NO_SHOW', startDateTime: at(48) }, NOW)).toBe(false);
  });
});

describe('seriesPosition', () => {
  it('reads the position inside a series', () => {
    const reservation = { series: { id: 's', occurrenceCount: 4 }, occurrenceIndex: 2 };

    expect(seriesPosition(reservation as Reservation)).toEqual({ index: 2, total: 4 });
  });

  it('is null for a single reservation', () => {
    expect(seriesPosition({ series: null, occurrenceIndex: null })).toBeNull();
  });
});
