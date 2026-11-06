import { describe, expect, it } from 'vitest';
import {
  TIME_OPTIONS,
  addDaysToDate,
  dayRange,
  firstBookableDate,
  formatRange,
  hoursBetween,
  todayLocal,
  toInstant,
  toLocal,
  weekdayOf,
} from '@/lib/booking-time';

describe('toInstant and toLocal', () => {
  it('reads the business time zone, five hours behind UTC', () => {
    expect(toInstant('2026-11-12', '10:00')).toBe('2026-11-12T15:00:00.000Z');
    expect(toLocal('2026-11-12T15:00:00Z')).toEqual({ date: '2026-11-12', time: '10:00' });
  });

  it('keeps the local date when the instant is already the next day in UTC', () => {
    expect(toInstant('2026-11-12', '21:30')).toBe('2026-11-13T02:30:00.000Z');
    expect(toLocal('2026-11-13T02:30:00Z')).toEqual({ date: '2026-11-12', time: '21:30' });
  });

  it('round-trips every slot of the day', () => {
    for (const time of TIME_OPTIONS) {
      expect(toLocal(toInstant('2026-11-12', time)).time).toBe(time);
    }
  });
});

describe('days', () => {
  it('uses the business day, not the UTC one', () => {
    expect(todayLocal(new Date('2026-11-12T03:00:00Z'))).toBe('2026-11-11');
    expect(todayLocal(new Date('2026-11-12T05:00:00Z'))).toBe('2026-11-12');
  });

  it('starts bookings tomorrow', () => {
    expect(firstBookableDate(new Date('2026-11-06T15:00:00Z'))).toBe('2026-11-07');
  });

  it('adds days across a month', () => {
    expect(addDaysToDate('2026-11-30', 1)).toBe('2026-12-01');
  });

  it('gives the local day as a half-open range of instants', () => {
    expect(dayRange('2026-11-12')).toEqual({
      from: '2026-11-12T05:00:00.000Z',
      to: '2026-11-13T05:00:00.000Z',
    });
  });

  it('numbers weekdays from Sunday', () => {
    expect(weekdayOf('2026-11-12')).toBe(4);
    expect(weekdayOf('2026-11-15')).toBe(0);
  });
});

describe('time options', () => {
  it('offers every 30 minutes of the day', () => {
    expect(TIME_OPTIONS).toHaveLength(48);
    expect(TIME_OPTIONS[0]).toBe('00:00');
    expect(TIME_OPTIONS[1]).toBe('00:30');
    expect(TIME_OPTIONS[47]).toBe('23:30');
  });
});

describe('formatting', () => {
  it('shows a same-day range with a single date', () => {
    expect(formatRange('2026-11-12T15:00:00Z', '2026-11-12T16:30:00Z')).toContain('10:00–11:30');
  });

  it('shows both dates when the range crosses midnight', () => {
    expect(formatRange('2026-11-12T15:00:00Z', '2026-11-13T15:00:00Z')).toContain('→');
  });

  it('measures hours between two instants', () => {
    expect(hoursBetween('2026-11-12T15:00:00Z', '2026-11-14T15:00:00Z')).toBe(48);
  });
});
