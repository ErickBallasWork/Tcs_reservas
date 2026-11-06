import { describe, expect, it } from 'vitest';
import {
  countFreeSpaces,
  FLOOR_STATES,
  isZoneInteractive,
  presentState,
  seatAriaLabel,
  stateText,
  zoneAriaLabel,
} from '@/lib/floor-plan/zone-presentation';
import type { FloorPlanStatus, FloorZone, FloorZoneStatus } from '@/lib/floor-plan/types';

const zone = (overrides: Partial<FloorZone> = {}): FloorZone => ({
  id: 'z1',
  name: 'Sala Board',
  kind: 'ROOM',
  x: 0,
  y: 0,
  width: 100,
  height: 80,
  isReservable: true,
  sortOrder: 0,
  resourceId: 'r1',
  resource: { id: 'r1', name: 'Board', type: 'MEETING_ROOM', capacity: 14, isActive: true },
  seats: [],
  ...overrides,
});

const status = (overrides: Partial<FloorZoneStatus> = {}): FloorZoneStatus => ({
  zoneId: 'z1',
  state: 'FREE',
  reason: null,
  totalSeats: null,
  freeSeats: null,
  ...overrides,
});

describe('presentState', () => {
  it('never relies on color alone: every reservable state has an icon, pattern or border', () => {
    for (const state of FLOOR_STATES.filter((state) => state !== 'NOT_RESERVABLE')) {
      const presentation = presentState(state);
      const cue =
        presentation.icon !== 'none' ||
        presentation.pattern !== 'none' ||
        presentation.border === 'dashed';
      expect(cue).toBe(true);
    }
  });

  it('maps each state to its label, icon and pattern', () => {
    expect(presentState('FREE')).toMatchObject({ label: 'Libre', icon: 'check', border: 'solid' });
    expect(presentState('OCCUPIED')).toMatchObject({
      label: 'Ocupada',
      icon: 'lock',
      pattern: 'hatch',
    });
    expect(presentState('MINE')).toMatchObject({ label: 'Tu reserva', icon: 'star', tone: 'mine' });
    expect(presentState('OUT_OF_FILTER')).toMatchObject({ border: 'dashed', dimmed: true });
    expect(presentState('NOT_RESERVABLE')).toMatchObject({ label: 'No reservable', tone: 'muted' });
  });

  it('gives each state a different label', () => {
    expect(new Set(FLOOR_STATES.map((state) => presentState(state).label)).size).toBe(5);
  });
});

describe('stateText', () => {
  it('shows the reason instead of the state when out of the filter', () => {
    expect(stateText(status({ state: 'OUT_OF_FILTER', reason: 'CAPACITY' }))).toBe('Capacidad');
    expect(stateText(status({ state: 'OUT_OF_FILTER', reason: 'CLOSED' }))).toBe('Cerrado');
  });

  it('shows the state label otherwise, and nothing while loading', () => {
    expect(stateText(status({ state: 'OCCUPIED' }))).toBe('Ocupada');
    expect(stateText(undefined)).toBe('');
  });
});

describe('zoneAriaLabel', () => {
  it('reads name, capacity and state of a room', () => {
    expect(zoneAriaLabel(zone(), status())).toBe('Sala Board, 14 personas, libre');
  });

  it('reads the free seats of a lab', () => {
    const lab = zone({ name: 'IA Lab', kind: 'LAB' });

    expect(zoneAriaLabel(lab, status({ state: 'OCCUPIED', totalSeats: 8, freeSeats: 3 }))).toBe(
      'IA Lab, 3 de 8 sillas libres, ocupada',
    );
  });

  it('adds the reason when out of the filter', () => {
    expect(zoneAriaLabel(zone(), status({ state: 'OUT_OF_FILTER', reason: 'TYPE' }))).toBe(
      'Sala Board, 14 personas, fuera del filtro: tipo',
    );
  });

  it('reads only the name and capacity while the state loads', () => {
    expect(zoneAriaLabel(zone(), undefined)).toBe('Sala Board, 14 personas');
  });
});

describe('seatAriaLabel', () => {
  it('reads the seat and its state', () => {
    expect(seatAriaLabel({ resourceId: 'l1', name: 'L-01' }, 'MINE')).toBe(
      'Silla L-01, tu reserva',
    );
  });
});

describe('isZoneInteractive', () => {
  it('accepts reservable rooms and labs linked to a resource', () => {
    expect(isZoneInteractive(zone())).toBe(true);
    expect(isZoneInteractive(zone({ kind: 'LAB' }))).toBe(true);
  });

  it('rejects decorative zones, labels and unlinked or non reservable zones', () => {
    expect(isZoneInteractive(zone({ kind: 'DECORATIVE' }))).toBe(false);
    expect(isZoneInteractive(zone({ kind: 'LABEL' }))).toBe(false);
    expect(isZoneInteractive(zone({ isReservable: false }))).toBe(false);
    expect(isZoneInteractive(zone({ resource: null, resourceId: null }))).toBe(false);
  });
});

describe('countFreeSpaces', () => {
  it('counts free rooms and the free seats of a partly busy lab', () => {
    const zones = [
      zone(),
      zone({ id: 'z2' }),
      zone({ id: 'z3', kind: 'LAB' }),
      zone({ id: 'z4', kind: 'DECORATIVE', isReservable: false }),
    ];
    const plan: FloorPlanStatus = {
      floorPlanId: 'p',
      from: '',
      to: '',
      seats: [],
      zones: [
        status(),
        status({ zoneId: 'z2', state: 'OCCUPIED' }),
        status({ zoneId: 'z3', state: 'OCCUPIED', totalSeats: 8, freeSeats: 3 }),
        status({ zoneId: 'z4', state: 'NOT_RESERVABLE' }),
      ],
    };

    expect(countFreeSpaces(zones, plan)).toBe(4);
  });
});
