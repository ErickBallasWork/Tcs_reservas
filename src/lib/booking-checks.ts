import type { ReservationPurpose, ResourceType } from '@/api/types';
import { hoursBetween, msUntil, SLOT_MINUTES } from '@/lib/booking-time';

export const MIN_ADVANCE_HOURS = 24;
export const MAX_DURATION_HOURS = 48;

export type BookingProblem =
  | 'END_BEFORE_START'
  | 'NOT_ALIGNED'
  | 'MIN_ADVANCE'
  | 'MAX_DURATION'
  | 'EDIT_TOO_LATE'
  | 'MISSING_PURPOSE'
  | 'MISSING_DETAIL'
  | 'ATTENDEES_REQUIRED'
  | 'ATTENDEES_EXCEEDS_CAPACITY';

export interface BookingDraft {
  start: string;
  end: string;
  resourceType: ResourceType;
  capacity: number;
  attendees: string;
  purpose: ReservationPurpose | '';
  detail: string;
  editing?: { originalStart: string; slotChanged: boolean };
}

export function parseAttendees(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const attendees = Number(trimmed);
  return attendees >= 1 ? attendees : null;
}

function isAligned(value: string): boolean {
  return new Date(value).getTime() % (SLOT_MINUTES * 60_000) === 0;
}

export function checkDraft(draft: BookingDraft, now: Date = new Date()): BookingProblem[] {
  const problems: BookingProblem[] = [];
  const startMs = new Date(draft.start).getTime();
  const endMs = new Date(draft.end).getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    problems.push('END_BEFORE_START');
  } else {
    if (!isAligned(draft.start) || !isAligned(draft.end)) problems.push('NOT_ALIGNED');
    const movesSlot = !draft.editing || draft.editing.slotChanged;
    if (movesSlot && msUntil(draft.start, now) < MIN_ADVANCE_HOURS * 3_600_000) {
      problems.push('MIN_ADVANCE');
    }
    if (hoursBetween(draft.start, draft.end) > MAX_DURATION_HOURS) problems.push('MAX_DURATION');
    if (
      draft.editing?.slotChanged &&
      msUntil(draft.editing.originalStart, now) < MIN_ADVANCE_HOURS * 3_600_000
    ) {
      problems.push('EDIT_TOO_LATE');
    }
  }

  if (!draft.purpose) problems.push('MISSING_PURPOSE');
  if (draft.detail.trim().length === 0) problems.push('MISSING_DETAIL');

  if (draft.resourceType !== 'LAPTOP') {
    const attendees = parseAttendees(draft.attendees);
    if (attendees === null) problems.push('ATTENDEES_REQUIRED');
    else if (attendees > draft.capacity) problems.push('ATTENDEES_EXCEEDS_CAPACITY');
  }
  return problems;
}
