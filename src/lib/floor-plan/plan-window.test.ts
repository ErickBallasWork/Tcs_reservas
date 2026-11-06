import { describe, expect, it } from 'vitest';
import {
  buildingOfResource,
  matchesFilters,
  planWindow,
  resourceInBuilding,
  statusQuery,
  windowProblem,
} from '@/lib/floor-plan/plan-window';
import type { BookableResource } from '@/lib/resource-options';

const window = {
  startDate: '2026-11-12',
  startTime: '09:00',
  endDate: '2026-11-12',
  endTime: '10:30',
  attendees: '',
};

const resource = (id: string, buildingId: string): BookableResource => ({
  id,
  name: id,
  type: 'MEETING_ROOM',
  capacity: 6,
  buildingId,
  buildingName: buildingId,
  labName: null,
});

describe('planWindow', () => {
  it('turns business time in Guayaquil into instants', () => {
    expect(planWindow(window)).toEqual({
      from: '2026-11-12T14:00:00.000Z',
      to: '2026-11-12T15:30:00.000Z',
    });
  });

  it('supports a window that ends on the next day', () => {
    expect(planWindow({ ...window, endDate: '2026-11-13', endTime: '08:00' }).to).toBe(
      '2026-11-13T13:00:00.000Z',
    );
  });
});

describe('windowProblem', () => {
  it('accepts a window up to 48 hours', () => {
    expect(windowProblem(planWindow(window))).toBeNull();
    expect(
      windowProblem(planWindow({ ...window, endDate: '2026-11-14', endTime: '09:00' })),
    ).toBeNull();
  });

  it('rejects an end before or equal to the start', () => {
    expect(windowProblem(planWindow({ ...window, endTime: '09:00' }))).toBe('END_BEFORE_START');
    expect(windowProblem(planWindow({ ...window, endTime: '08:00' }))).toBe('END_BEFORE_START');
  });

  it('rejects a window longer than 48 hours', () => {
    expect(windowProblem(planWindow({ ...window, endDate: '2026-11-14', endTime: '09:30' }))).toBe(
      'TOO_LONG',
    );
  });
});

describe('statusQuery', () => {
  it('sends only the window when no filter is set', () => {
    expect(statusQuery(window, 'ALL')).toEqual({
      from: '2026-11-12T14:00:00.000Z',
      to: '2026-11-12T15:30:00.000Z',
    });
  });

  it('adds the type and the attendees as minimum capacity', () => {
    expect(statusQuery({ ...window, attendees: '8' }, 'AI_LAB')).toMatchObject({
      type: 'AI_LAB',
      minCapacity: 8,
    });
  });

  it('ignores an invalid capacity', () => {
    expect(statusQuery({ ...window, attendees: 'abc' }, 'ALL')).not.toHaveProperty('minCapacity');
  });

  it('does not query an invalid window', () => {
    expect(statusQuery({ ...window, endTime: '08:00' }, 'ALL')).toBeNull();
  });
});

describe('matchesFilters', () => {
  it('keeps resources of the chosen type and enough capacity', () => {
    expect(matchesFilters({ type: 'AI_LAB', capacity: 10 }, 'AI_LAB', 8)).toBe(true);
    expect(matchesFilters({ type: 'AI_LAB', capacity: 10 }, 'ALL', undefined)).toBe(true);
  });

  it('drops resources of another type or too small', () => {
    expect(matchesFilters({ type: 'MEETING_ROOM', capacity: 10 }, 'AI_LAB', undefined)).toBe(false);
    expect(matchesFilters({ type: 'MEETING_ROOM', capacity: 4 }, 'ALL', 6)).toBe(false);
  });
});

describe('building sync', () => {
  const resources = [resource('a1', 'A'), resource('a2', 'A'), resource('b1', 'B')];

  it('finds the building of the chosen resource', () => {
    expect(buildingOfResource('b1', resources)).toBe('B');
    expect(buildingOfResource('missing', resources)).toBeUndefined();
  });

  it('keeps the resource when it belongs to the building', () => {
    expect(resourceInBuilding('a2', 'A', resources)).toBe('a2');
  });

  it('moves to the first resource of the new building', () => {
    expect(resourceInBuilding('a2', 'B', resources)).toBe('b1');
  });

  it('keeps the resource when the building has none', () => {
    expect(resourceInBuilding('a2', 'C', resources)).toBe('a2');
  });
});
