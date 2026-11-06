import { addDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const BUSINESS_TIME_ZONE = 'America/Guayaquil';
export const SLOT_MINUTES = 30;

const MINUTE_MS = 60_000;

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const shortDateFormatter = new Intl.DateTimeFormat('es-EC', {
  timeZone: BUSINESS_TIME_ZONE,
  day: 'numeric',
  month: 'short',
});

export interface LocalDateTime {
  date: string;
  time: string;
}

export const TIME_OPTIONS: string[] = Array.from({ length: (24 * 60) / SLOT_MINUTES }, (_, i) => {
  const minutes = i * SLOT_MINUTES;
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  return `${hours}:${String(minutes % 60).padStart(2, '0')}`;
});

export function toLocal(value: string | Date): LocalDateTime {
  const parts: Record<string, string> = {};
  for (const part of partsFormatter.formatToParts(new Date(value))) parts[part.type] = part.value;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

function wallClock(date: string, time: string): number {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return Date.UTC(year, month - 1, day, hours, minutes);
}

export function toInstant(date: string, time: string): string {
  const wall = wallClock(date, time);
  let guess = wall;
  for (let attempt = 0; attempt < 2; attempt++) {
    const local = toLocal(new Date(guess));
    guess += wall - wallClock(local.date, local.time);
  }
  return new Date(guess).toISOString();
}

export function todayLocal(now: Date = new Date()): string {
  return toLocal(now).date;
}

export function addDaysToDate(date: string, days: number): string {
  return format(addDays(parseISO(date), days), 'yyyy-MM-dd');
}

export function firstBookableDate(now: Date = new Date()): string {
  return addDaysToDate(todayLocal(now), 1);
}

export function dayRange(date: string): { from: string; to: string } {
  return { from: toInstant(date, '00:00'), to: toInstant(addDaysToDate(date, 1), '00:00') };
}

export function weekdayOf(date: string): number {
  return parseISO(date).getDay();
}

export function formatDay(date: string): string {
  const text = format(parseISO(date), "EEEE d 'de' MMMM", { locale: es });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatRange(start: string, end: string): string {
  const from = toLocal(start);
  const to = toLocal(end);
  const day = shortDateFormatter.format(new Date(start));
  if (from.date === to.date) return `${day} · ${from.time}–${to.time}`;
  return `${day} ${from.time} → ${shortDateFormatter.format(new Date(end))} ${to.time}`;
}

export function hoursBetween(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / (MINUTE_MS * 60);
}

export function msUntil(value: string, now: Date = new Date()): number {
  return new Date(value).getTime() - now.getTime();
}
