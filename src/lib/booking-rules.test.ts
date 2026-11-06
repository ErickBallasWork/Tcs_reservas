import { describe, expect, it } from 'vitest';
import { type BookingInput, checkBooking } from '@/lib/booking-rules';

function booking(overrides: Partial<BookingInput> = {}): BookingInput {
  return {
    resourceId: 'r-102',
    start: '2026-12-01T09:00',
    end: '2026-12-01T10:00',
    reason: 'internal_meeting',
    detail: 'Planificación del sprint',
    ...overrides,
  };
}

describe('checkBooking', () => {
  it('accepts a valid booking', () => {
    expect(checkBooking(booking())).toEqual({
      rangeInvalid: false,
      overlap: false,
      anticipation: false,
      duration: false,
      missingFields: false,
    });
  });

  it('accepts exactly 48 hours', () => {
    expect(checkBooking(booking({ end: '2026-12-03T09:00' })).duration).toBe(false);
  });

  it('rejects more than 48 hours', () => {
    expect(checkBooking(booking({ end: '2026-12-03T09:30' })).duration).toBe(true);
  });

  it('rejects a booking without one day in advance', () => {
    const check = checkBooking(booking({ start: '2026-11-05T09:00', end: '2026-11-05T10:00' }));

    expect(check.anticipation).toBe(true);
  });

  it('rejects an end before the start', () => {
    expect(checkBooking(booking({ end: '2026-12-01T08:00' })).rangeInvalid).toBe(true);
  });

  it.each([
    ['without a purpose', { reason: '' as const }],
    ['with a blank detail', { detail: '   ' }],
  ])('flags missing fields %s', (_label, overrides) => {
    expect(checkBooking(booking(overrides)).missingFields).toBe(true);
  });

  it('detects an overlap with an active reservation', () => {
    const check = checkBooking(
      booking({ resourceId: 'r-101', start: '2026-11-10T11:00', end: '2026-11-10T13:00' }),
    );

    expect(check.overlap).toBe(true);
  });
});
