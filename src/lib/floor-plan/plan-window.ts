import { parseAttendees } from '@/lib/booking-checks';
import type { BookingFormValues } from '@/lib/booking-form';
import { hoursBetween, toInstant } from '@/lib/booking-time';
import type { FloorResourceType } from '@/lib/floor-plan/types';
import type { BookableResource } from '@/lib/resource-options';

export type TypeFilter = 'ALL' | FloorResourceType;
export type WindowProblem = 'END_BEFORE_START' | 'TOO_LONG';

export const TYPE_FILTERS: readonly TypeFilter[] = ['ALL', 'MEETING_ROOM', 'AI_LAB'];
export const MAX_WINDOW_HOURS = 48;
export const DEFAULT_START_TIME = '08:00';
export const DEFAULT_END_TIME = '10:00';

type WindowValues = Pick<BookingFormValues, 'startDate' | 'startTime' | 'endDate' | 'endTime'>;

export interface PlanWindow {
  from: string;
  to: string;
}

export interface StatusQuery extends PlanWindow {
  type?: FloorResourceType;
  minCapacity?: number;
}

export function planWindow(values: WindowValues): PlanWindow {
  return {
    from: toInstant(values.startDate, values.startTime),
    to: toInstant(values.endDate, values.endTime),
  };
}

export function windowProblem(window: PlanWindow): WindowProblem | null {
  const hours = hoursBetween(window.from, window.to);
  if (hours <= 0) return 'END_BEFORE_START';
  if (hours > MAX_WINDOW_HOURS) return 'TOO_LONG';
  return null;
}

export function minCapacityOf(attendees: string): number | undefined {
  return parseAttendees(attendees) ?? undefined;
}

export function statusQuery(
  values: WindowValues & Pick<BookingFormValues, 'attendees'>,
  type: TypeFilter,
): StatusQuery | null {
  const window = planWindow(values);
  if (windowProblem(window)) return null;
  const minCapacity = minCapacityOf(values.attendees);
  return {
    ...window,
    ...(type === 'ALL' ? {} : { type }),
    ...(minCapacity === undefined ? {} : { minCapacity }),
  };
}

export function matchesFilters(
  resource: { type: string; capacity: number },
  type: TypeFilter,
  minCapacity: number | undefined,
): boolean {
  if (type !== 'ALL' && resource.type !== type) return false;
  return minCapacity === undefined || resource.capacity >= minCapacity;
}

export function buildingOfResource(
  resourceId: string,
  resources: readonly BookableResource[],
): string | undefined {
  return resources.find((resource) => resource.id === resourceId)?.buildingId;
}

export function resourceInBuilding(
  currentResourceId: string,
  buildingId: string,
  resources: readonly BookableResource[],
): string {
  if (buildingOfResource(currentResourceId, resources) === buildingId) return currentResourceId;
  return resources.find((resource) => resource.buildingId === buildingId)?.id ?? currentResourceId;
}
