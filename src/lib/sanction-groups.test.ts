import { describe, expect, it } from 'vitest';
import type { Sanction } from '@/api/types';
import { activeSanctionIds, groupSanctionsByUser } from '@/lib/sanction-groups';

function sanction(id: string, userId: string, status: Sanction['status'] = 'ACTIVE'): Sanction {
  return {
    id,
    type: 'NO_SHOW',
    status,
    reason: 'No registró el uso de Sala A',
    startDate: '2026-11-11T15:20:00Z',
    endDate: null,
    resolvedAt: null,
    resolutionComment: null,
    user: { id: userId, fullName: `User ${userId}`, email: `${userId}@tcs.com` },
    resolvedBy: null,
    reservation: {
      id: `res-${id}`,
      startDateTime: '2026-11-11T15:00:00Z',
      endDateTime: '2026-11-11T16:00:00Z',
      resourceName: 'Sala A',
    },
  };
}

describe('groupSanctionsByUser', () => {
  it('groups the sanctions of the same person and keeps the order of first appearance', () => {
    const groups = groupSanctionsByUser([
      sanction('1', 'ana'),
      sanction('2', 'luis'),
      sanction('3', 'ana'),
    ]);

    expect(groups.map((group) => group.user.id)).toEqual(['ana', 'luis']);
    expect(groups[0].sanctions.map((s) => s.id)).toEqual(['1', '3']);
  });

  it('returns no groups for an empty list', () => {
    expect(groupSanctionsByUser([])).toEqual([]);
  });
});

describe('activeSanctionIds', () => {
  it('lists only the sanctions that still block the person', () => {
    const [group] = groupSanctionsByUser([
      sanction('1', 'ana'),
      sanction('2', 'ana', 'RESOLVED'),
      sanction('3', 'ana'),
    ]);

    expect(activeSanctionIds(group)).toEqual(['1', '3']);
  });
});
