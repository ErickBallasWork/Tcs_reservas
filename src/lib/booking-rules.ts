import { ACTIVE_STATUSES, FIRST_SELECTABLE_DATE } from '@/lib/availability';
import { reservations, resources } from '@/lib/mock-data';
import type { ReservationReason } from '@/types';

const HOUR_MS = 3_600_000;
const MAX_DURATION_HOURS = 48;

export interface BookingInput {
  resourceId: string;
  start: string;
  end: string;
  reason: ReservationReason | '';
  detail: string;
}

export interface BookingCheck {
  rangeInvalid: boolean;
  overlap: boolean;
  anticipation: boolean;
  duration: boolean;
  missingFields: boolean;
}

// Resources whose slots collide with the selected one:
// a lab blocks its laptops and a reserved laptop blocks the whole lab.
function getConflictingResourceIds(resourceId: string): string[] {
  const resource = resources.find((r) => r.id === resourceId);
  if (!resource) return [resourceId];
  if (resource.type === 'laptop' && resource.parentLabId) {
    return [resource.id, resource.parentLabId];
  }
  if (resource.type === 'ai_lab') {
    const laptopIds = resources.filter((r) => r.parentLabId === resource.id).map((r) => r.id);
    return [resource.id, ...laptopIds];
  }
  return [resource.id];
}

const reservationBounds = (date: string, startHour: number, endHour: number) => {
  const base = new Date(`${date}T00:00:00`).getTime();
  return { start: base + startHour * HOUR_MS, end: base + endHour * HOUR_MS };
};

export function checkBooking(input: BookingInput): BookingCheck {
  const missingFields = !input.reason || input.detail.trim().length === 0;

  const start = new Date(input.start).getTime();
  const end = new Date(input.end).getTime();
  const rangeInvalid = Number.isNaN(start) || Number.isNaN(end) || end <= start;

  if (rangeInvalid) {
    return {
      rangeInvalid,
      overlap: false,
      anticipation: false,
      duration: false,
      missingFields,
    };
  }

  const ids = getConflictingResourceIds(input.resourceId);
  const overlap = reservations.some((r) => {
    if (!ids.includes(r.resourceId) || !ACTIVE_STATUSES.includes(r.status)) {
      return false;
    }
    const b = reservationBounds(r.date, r.startHour, r.endHour);
    return b.start < end && b.end > start;
  });

  return {
    rangeInvalid,
    overlap,
    anticipation: input.start.slice(0, 10) < FIRST_SELECTABLE_DATE,
    duration: (end - start) / HOUR_MS > MAX_DURATION_HOURS,
    missingFields,
  };
}
