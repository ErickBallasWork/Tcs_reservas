import { addDays, format, parseISO } from "date-fns";
import { reservations } from "@/lib/mock-data";
import type { Resource, SlotStatus } from "@/types";

// Fixed "today" so the demo data keeps working. Replace with new Date() later.
export const MOCK_TODAY = "2026-11-05";
export const FIRST_SELECTABLE_DATE = format(
  addDays(parseISO(MOCK_TODAY), 1),
  "yyyy-MM-dd",
);
export const DEFAULT_DATE = "2026-11-10";

// Pending trainings also hold the slot while the Leader decides
export const ACTIVE_STATUSES = ["confirmed", "pending"];

function isOccupied(resourceId: string, date: string, hour: number) {
  return reservations.some(
    (r) =>
      r.resourceId === resourceId &&
      r.date === date &&
      ACTIVE_STATUSES.includes(r.status) &&
      hour >= r.startHour &&
      hour < r.endHour,
  );
}

export function getSlotStatus(
  resource: Resource,
  date: string,
  hour: number,
): SlotStatus {
  if (isOccupied(resource.id, date, hour)) return "occupied";
  // A laptop is blocked while its whole lab is reserved
  if (
    resource.type === "laptop" &&
    resource.parentLabId &&
    isOccupied(resource.parentLabId, date, hour)
  ) {
    return "blocked";
  }
  return "free";
}

export function getDaysWithReservations(): Set<string> {
  return new Set(
    reservations
      .filter((r) => ACTIVE_STATUSES.includes(r.status))
      .map((r) => r.date),
  );
}