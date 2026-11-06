import type { OpenWindow } from '@/api/types';
import { SLOT_MINUTES, toInstant } from '@/lib/booking-time';

export type SlotStatus = 'free' | 'occupied' | 'blocked' | 'closed';

export interface GridCell {
  start: string;
  end: string;
  status: SlotStatus;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface SlotSources {
  busySlots: readonly string[];
  openWindows: readonly OpenWindow[];
  lockingBusySlots?: readonly string[];
}

const SLOT_MS = SLOT_MINUTES * 60_000;

const normalize = (value: string) => new Date(value).toISOString();

export function slotStartsBetween(date: string, fromTime: string, toTime: string): string[] {
  const starts: string[] = [];
  const end = new Date(toInstant(date, toTime)).getTime();
  for (let t = new Date(toInstant(date, fromTime)).getTime(); t < end; t += SLOT_MS) {
    starts.push(new Date(t).toISOString());
  }
  return starts;
}

function isInsideOpenWindow(slotStart: number, windows: readonly OpenWindow[]): boolean {
  return windows.some(
    (window) =>
      new Date(window.start).getTime() <= slotStart &&
      slotStart + SLOT_MS <= new Date(window.end).getTime(),
  );
}

export function buildCells(slotStarts: readonly string[], sources: SlotSources): GridCell[] {
  const busy = new Set(sources.busySlots.map(normalize));
  const locking = new Set((sources.lockingBusySlots ?? []).map(normalize));
  return slotStarts.map((start) => {
    const startMs = new Date(start).getTime();
    let status: SlotStatus = 'free';
    if (!isInsideOpenWindow(startMs, sources.openWindows)) status = 'closed';
    else if (busy.has(normalize(start)))
      status = locking.has(normalize(start)) ? 'blocked' : 'occupied';
    return { start, end: new Date(startMs + SLOT_MS).toISOString(), status };
  });
}

export function freeRanges(cells: readonly GridCell[]): TimeRange[] {
  const ranges: TimeRange[] = [];
  for (const cell of cells) {
    if (cell.status !== 'free') continue;
    const last = ranges[ranges.length - 1];
    if (last && last.end === cell.start) last.end = cell.end;
    else ranges.push({ start: cell.start, end: cell.end });
  }
  return ranges;
}

export type RangeConflict = 'SLOT_TAKEN' | 'OUTSIDE_OPERATING_HOURS';

export function findRangeConflict(
  start: string,
  end: string,
  sources: Pick<SlotSources, 'busySlots' | 'openWindows'>,
): RangeConflict | null {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) return null;
  const busy = new Set(sources.busySlots.map(normalize));
  for (let t = startMs; t < endMs; t += SLOT_MS) {
    if (!isInsideOpenWindow(t, sources.openWindows)) return 'OUTSIDE_OPERATING_HOURS';
    if (busy.has(new Date(t).toISOString())) return 'SLOT_TAKEN';
  }
  return null;
}

export function withoutRange(slots: readonly string[], start: string, end: string): string[] {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return slots.filter((slot) => {
    const slotMs = new Date(slot).getTime();
    return slotMs < startMs || slotMs >= endMs;
  });
}
