import { describe, expect, it } from 'vitest';
import type { PendingApproval } from '@/api/types';
import { groupPendingApprovals } from '@/lib/pending-approvals';

const pending = (id: string, seriesId: string | null = null): PendingApproval =>
  ({
    id,
    series: seriesId ? { id: seriesId, occurrenceCount: 4 } : null,
  }) as PendingApproval;

describe('groupPendingApprovals', () => {
  it('keeps loose reservations as single entries in order', () => {
    const entries = groupPendingApprovals([pending('a'), pending('b')]);

    expect(entries.map((entry) => [entry.kind, entry.key])).toEqual([
      ['single', 'a'],
      ['single', 'b'],
    ]);
  });

  it('gathers the occurrences of a series in one group', () => {
    const entries = groupPendingApprovals([pending('a', 's1'), pending('b'), pending('c', 's1')]);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ kind: 'series', seriesId: 's1', seriesTotal: 4 });
    expect(entries[0]?.kind === 'series' && entries[0].items.map((item) => item.id)).toEqual([
      'a',
      'c',
    ]);
  });

  it('places a group where its first occurrence appears', () => {
    const entries = groupPendingApprovals([pending('x'), pending('a', 's1'), pending('b', 's1')]);

    expect(entries.map((entry) => entry.key)).toEqual(['x', 's1']);
  });

  it('returns nothing for an empty inbox', () => {
    expect(groupPendingApprovals([])).toEqual([]);
  });
});
