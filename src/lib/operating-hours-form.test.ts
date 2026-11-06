import { describe, expect, it } from 'vitest';
import {
  CLOSE_OPTIONS,
  emptyWeek,
  weekFromWindows,
  weekHasProblem,
  windowsFromWeek,
} from '@/lib/operating-hours-form';

describe('weekFromWindows and windowsFromWeek', () => {
  it('groups the windows by weekday and orders them by opening time', () => {
    const week = weekFromWindows([
      { dayOfWeek: 1, opensAt: '14:00', closesAt: '18:00' },
      { dayOfWeek: 1, opensAt: '08:00', closesAt: '12:00' },
      { dayOfWeek: 0, opensAt: '09:00', closesAt: '13:00' },
    ]);

    expect(week[1]).toEqual([
      { opensAt: '08:00', closesAt: '12:00' },
      { opensAt: '14:00', closesAt: '18:00' },
    ]);
    expect(week[0]).toHaveLength(1);
    expect(week[2]).toEqual([]);
  });

  it('round-trips a schedule, starting the week on Monday', () => {
    const windows = [
      { dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' },
      { dayOfWeek: 0, opensAt: '09:00', closesAt: '13:00' },
    ];

    expect(windowsFromWeek(weekFromWindows(windows))).toEqual(windows);
  });

  it('turns an empty week into no windows', () => {
    expect(windowsFromWeek(emptyWeek())).toEqual([]);
  });
});

describe('weekHasProblem', () => {
  it('accepts a valid day with two windows', () => {
    const week = weekFromWindows([
      { dayOfWeek: 2, opensAt: '08:00', closesAt: '12:00' },
      { dayOfWeek: 2, opensAt: '12:00', closesAt: '18:00' },
    ]);

    expect(weekHasProblem(week)).toBe(false);
  });

  it('rejects closing at or before opening', () => {
    expect(
      weekHasProblem(weekFromWindows([{ dayOfWeek: 2, opensAt: '10:00', closesAt: '10:00' }])),
    ).toBe(true);
    expect(
      weekHasProblem(weekFromWindows([{ dayOfWeek: 2, opensAt: '12:00', closesAt: '09:00' }])),
    ).toBe(true);
  });

  it('rejects overlapping windows in the same day', () => {
    const week = weekFromWindows([
      { dayOfWeek: 2, opensAt: '08:00', closesAt: '12:30' },
      { dayOfWeek: 2, opensAt: '12:00', closesAt: '18:00' },
    ]);

    expect(weekHasProblem(week)).toBe(true);
  });

  it('allows closing at midnight', () => {
    expect(CLOSE_OPTIONS.at(-1)).toBe('24:00');
    expect(
      weekHasProblem(weekFromWindows([{ dayOfWeek: 2, opensAt: '08:00', closesAt: '24:00' }])),
    ).toBe(false);
  });
});
