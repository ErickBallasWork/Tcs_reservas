import type { Sanction } from '@/api/types';

export interface SanctionGroup {
  user: Sanction['user'];
  sanctions: Sanction[];
}

export function groupSanctionsByUser(sanctions: readonly Sanction[]): SanctionGroup[] {
  const groups = new Map<string, SanctionGroup>();
  for (const sanction of sanctions) {
    const group = groups.get(sanction.user.id);
    if (group) group.sanctions.push(sanction);
    else groups.set(sanction.user.id, { user: sanction.user, sanctions: [sanction] });
  }
  return [...groups.values()];
}

export function activeSanctionIds(group: SanctionGroup): string[] {
  return group.sanctions.filter((sanction) => sanction.status === 'ACTIVE').map((s) => s.id);
}
