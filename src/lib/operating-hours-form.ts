import type { OperatingWindow } from '@/api/types';
import { TIME_OPTIONS } from '@/lib/booking-time';

export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const OPEN_OPTIONS = TIME_OPTIONS;
export const CLOSE_OPTIONS = [...TIME_OPTIONS.slice(1), '24:00'];

export interface DayWindow {
  opensAt: string;
  closesAt: string;
}

export type WeekForm = Record<number, DayWindow[]>;

export const DEFAULT_WINDOW: DayWindow = { opensAt: '08:00', closesAt: '18:00' };

export function emptyWeek(): WeekForm {
  return Object.fromEntries(WEEK_ORDER.map((day) => [day, []]));
}

export function weekFromWindows(windows: readonly OperatingWindow[]): WeekForm {
  const week = emptyWeek();
  for (const window of windows) {
    week[window.dayOfWeek].push({ opensAt: window.opensAt, closesAt: window.closesAt });
  }
  for (const day of WEEK_ORDER) week[day].sort((a, b) => a.opensAt.localeCompare(b.opensAt));
  return week;
}

export function windowsFromWeek(week: WeekForm): OperatingWindow[] {
  return WEEK_ORDER.flatMap((dayOfWeek) =>
    week[dayOfWeek].map((window) => ({ dayOfWeek, ...window })),
  );
}

export function weekHasProblem(week: WeekForm): boolean {
  return WEEK_ORDER.some((day) => {
    const sorted = [...week[day]].sort((a, b) => a.opensAt.localeCompare(b.opensAt));
    return sorted.some(
      (window, index) =>
        window.opensAt >= window.closesAt ||
        (index > 0 && sorted[index - 1].closesAt > window.opensAt),
    );
  });
}
