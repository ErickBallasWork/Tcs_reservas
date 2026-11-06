import { describe, expect, it } from 'vitest';
import {
  buildCells,
  findRangeConflict,
  freeRanges,
  slotStartsBetween,
  withoutRange,
} from '@/lib/slot-grid';

const open = [{ start: '2026-11-12T13:00:00.000Z', end: '2026-11-12T23:00:00.000Z' }];

describe('slotStartsBetween', () => {
  it('lists every 30 minutes of a local time range', () => {
    const starts = slotStartsBetween('2026-11-12', '08:00', '10:00');

    expect(starts).toEqual([
      '2026-11-12T13:00:00.000Z',
      '2026-11-12T13:30:00.000Z',
      '2026-11-12T14:00:00.000Z',
      '2026-11-12T14:30:00.000Z',
    ]);
  });
});

describe('buildCells', () => {
  const starts = slotStartsBetween('2026-11-12', '07:30', '10:00');

  it('marks cells outside the open windows as closed', () => {
    const cells = buildCells(starts, { busySlots: [], openWindows: open });

    expect(cells.map((c) => c.status)).toEqual(['closed', 'free', 'free', 'free', 'free']);
  });

  it('marks busy cells as occupied', () => {
    const cells = buildCells(starts, {
      busySlots: ['2026-11-12T14:00:00.000Z'],
      openWindows: open,
    });

    expect(cells.map((c) => c.status)).toEqual(['closed', 'free', 'free', 'occupied', 'free']);
  });

  it('marks a busy laptop cell as blocked when the lab is busy at the same time', () => {
    const cells = buildCells(starts, {
      busySlots: ['2026-11-12T14:00:00.000Z', '2026-11-12T14:30:00.000Z'],
      lockingBusySlots: ['2026-11-12T14:00:00.000Z'],
      openWindows: open,
    });

    expect(cells.map((c) => c.status)).toEqual(['closed', 'free', 'free', 'blocked', 'occupied']);
  });

  it('treats everything as closed without open windows', () => {
    const cells = buildCells(starts, { busySlots: [], openWindows: [] });

    expect(cells.every((c) => c.status === 'closed')).toBe(true);
  });
});

describe('freeRanges', () => {
  it('merges contiguous free cells into ranges', () => {
    const cells = buildCells(slotStartsBetween('2026-11-12', '08:00', '11:00'), {
      busySlots: ['2026-11-12T14:00:00.000Z'],
      openWindows: open,
    });

    expect(freeRanges(cells)).toEqual([
      { start: '2026-11-12T13:00:00.000Z', end: '2026-11-12T14:00:00.000Z' },
      { start: '2026-11-12T14:30:00.000Z', end: '2026-11-12T16:00:00.000Z' },
    ]);
  });
});

describe('findRangeConflict', () => {
  const sources = { busySlots: ['2026-11-12T15:00:00.000Z'], openWindows: open };

  it('finds nothing in a free range', () => {
    expect(
      findRangeConflict('2026-11-12T13:00:00.000Z', '2026-11-12T15:00:00.000Z', sources),
    ).toBeNull();
  });

  it('finds an occupied slot', () => {
    expect(findRangeConflict('2026-11-12T14:30:00Z', '2026-11-12T15:30:00Z', sources)).toBe(
      'SLOT_TAKEN',
    );
  });

  it('finds a slot outside the operating hours before a busy one', () => {
    expect(findRangeConflict('2026-11-12T12:30:00Z', '2026-11-12T15:30:00Z', sources)).toBe(
      'OUTSIDE_OPERATING_HOURS',
    );
  });

  it('ignores an invalid range', () => {
    expect(findRangeConflict('2026-11-12T15:00:00Z', '2026-11-12T14:00:00Z', sources)).toBeNull();
  });
});

describe('withoutRange', () => {
  it('drops the slots that belong to the range, end excluded', () => {
    const slots = [
      '2026-11-12T14:30:00.000Z',
      '2026-11-12T15:00:00.000Z',
      '2026-11-12T15:30:00.000Z',
      '2026-11-12T16:00:00.000Z',
    ];

    expect(withoutRange(slots, '2026-11-12T15:00:00Z', '2026-11-12T16:00:00Z')).toEqual([
      '2026-11-12T14:30:00.000Z',
      '2026-11-12T16:00:00.000Z',
    ]);
  });
});
