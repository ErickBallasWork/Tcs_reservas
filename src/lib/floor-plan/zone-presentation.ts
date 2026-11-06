import { floorPlanLabels, floorStateLabels, floorStateReasonLabels } from '@/lib/labels';
import type {
  FloorPlanStatus,
  FloorSeat,
  FloorState,
  FloorZone,
  FloorZoneStatus,
} from '@/lib/floor-plan/types';

export type StateIcon = 'check' | 'lock' | 'star' | 'filter' | 'none';
export type StateTone = 'free' | 'occupied' | 'mine' | 'muted';

export interface StatePresentation {
  label: string;
  icon: StateIcon;
  tone: StateTone;
  pattern: 'none' | 'hatch';
  border: 'solid' | 'dashed' | 'none';
  dimmed: boolean;
}

export const FLOOR_STATES: readonly FloorState[] = [
  'FREE',
  'OCCUPIED',
  'MINE',
  'OUT_OF_FILTER',
  'NOT_RESERVABLE',
];

const PRESENTATION: Record<FloorState, Omit<StatePresentation, 'label'>> = {
  FREE: { icon: 'check', tone: 'free', pattern: 'none', border: 'solid', dimmed: false },
  OCCUPIED: { icon: 'lock', tone: 'occupied', pattern: 'hatch', border: 'solid', dimmed: false },
  MINE: { icon: 'star', tone: 'mine', pattern: 'none', border: 'solid', dimmed: false },
  OUT_OF_FILTER: { icon: 'filter', tone: 'muted', pattern: 'none', border: 'dashed', dimmed: true },
  NOT_RESERVABLE: { icon: 'none', tone: 'muted', pattern: 'none', border: 'none', dimmed: false },
};

export function presentState(state: FloorState): StatePresentation {
  return { label: floorStateLabels[state], ...PRESENTATION[state] };
}

export function stateText(status: FloorZoneStatus | undefined): string {
  if (!status) return '';
  if (status.state === 'OUT_OF_FILTER' && status.reason) {
    return floorStateReasonLabels[status.reason];
  }
  return floorStateLabels[status.state];
}

export function isZoneInteractive(zone: FloorZone): boolean {
  return (
    (zone.kind === 'ROOM' || zone.kind === 'LAB') && zone.isReservable && zone.resource !== null
  );
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function stateDescription(status: FloorZoneStatus | undefined): string | null {
  if (!status) return null;
  const label = lowerFirst(floorStateLabels[status.state]);
  if (status.state === 'OUT_OF_FILTER' && status.reason) {
    return `${label}: ${lowerFirst(floorStateReasonLabels[status.reason])}`;
  }
  return label;
}

export function seatSummary(
  status: FloorZoneStatus | undefined,
): { free: number; total: number } | null {
  if (!status || status.totalSeats === null || status.freeSeats === null) return null;
  return { free: status.freeSeats, total: status.totalSeats };
}

export function zoneAriaLabel(zone: FloorZone, status: FloorZoneStatus | undefined): string {
  const parts = [zone.name];
  const seats = seatSummary(status);
  if (zone.kind === 'LAB' && seats) {
    parts.push(floorPlanLabels.seatsFreeLong(seats.free, seats.total));
  } else if (zone.resource) {
    parts.push(floorPlanLabels.people(zone.resource.capacity));
  }
  const state = stateDescription(status);
  if (state) parts.push(state);
  return parts.join(', ');
}

export function seatAriaLabel(seat: FloorSeat, state: FloorState | undefined): string {
  const name = `${floorPlanLabels.seat} ${seat.name}`;
  return state ? `${name}, ${lowerFirst(floorStateLabels[state])}` : name;
}

export function seatStates(status: FloorPlanStatus | undefined): Map<string, FloorState> {
  return new Map((status?.seats ?? []).map((seat) => [seat.resourceId, seat.state]));
}

export function zoneStatuses(status: FloorPlanStatus | undefined): Map<string, FloorZoneStatus> {
  return new Map((status?.zones ?? []).map((zone) => [zone.zoneId, zone]));
}

export function countFreeSpaces(zones: readonly FloorZone[], status: FloorPlanStatus): number {
  const byZone = zoneStatuses(status);
  return zones.reduce((total, zone) => {
    const zoneStatus = byZone.get(zone.id);
    if (!zoneStatus || !isZoneInteractive(zone)) return total;
    if (zoneStatus.state === 'FREE') return total + 1;
    if (zone.kind === 'LAB' && zoneStatus.state === 'OCCUPIED') {
      return total + (zoneStatus.freeSeats ?? 0);
    }
    return total;
  }, 0);
}
