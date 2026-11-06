import { describe, expect, it } from 'vitest';
import {
  canGrantRole,
  canHaveAssociates,
  isValidAssignment,
  setBuilding,
  toggleRole,
} from '@/lib/role-assignment';

describe('canGrantRole', () => {
  it('lets an ADMIN grant regular roles only', () => {
    expect(canGrantRole(['ADMIN'], 'LIDER')).toBe(true);
    expect(canGrantRole(['ADMIN'], 'ADMIN')).toBe(false);
    expect(canGrantRole(['ADMIN'], 'SUPERADMIN')).toBe(false);
  });

  it('lets a SUPERADMIN grant any role', () => {
    expect(canGrantRole(['SUPERADMIN'], 'ADMIN')).toBe(true);
    expect(canGrantRole(['SUPERADMIN'], 'SUPERADMIN')).toBe(true);
  });
});

describe('toggleRole', () => {
  it('adds a missing role and removes a present one', () => {
    const withLeader = toggleRole([{ role: 'ASOCIADO' }], 'LIDER');

    expect(withLeader).toEqual([{ role: 'ASOCIADO' }, { role: 'LIDER' }]);
    expect(toggleRole(withLeader, 'LIDER')).toEqual([{ role: 'ASOCIADO' }]);
  });

  it('does not mutate the previous list', () => {
    const previous = [{ role: 'ASOCIADO' as const }];

    toggleRole(previous, 'LIDER');

    expect(previous).toHaveLength(1);
  });
});

describe('isValidAssignment', () => {
  it('needs at least one role', () => {
    expect(isValidAssignment([])).toBe(false);
    expect(isValidAssignment([{ role: 'ASOCIADO' }])).toBe(true);
  });

  it('needs a building for the SPOC de Edificio', () => {
    expect(isValidAssignment([{ role: 'SPOC_EDIFICIO' }])).toBe(false);
    expect(isValidAssignment([{ role: 'SPOC_EDIFICIO', buildingId: 'b1' }])).toBe(true);
  });
});

describe('setBuilding', () => {
  it('sets the building of the role and clears it when empty', () => {
    const list = [{ role: 'ASOCIADO' as const }, { role: 'SPOC_EDIFICIO' as const }];

    const withBuilding = setBuilding(list, 'SPOC_EDIFICIO', 'b1');

    expect(withBuilding[1]).toEqual({ role: 'SPOC_EDIFICIO', buildingId: 'b1' });
    expect(setBuilding(withBuilding, 'SPOC_EDIFICIO', '')[1].buildingId).toBeUndefined();
  });
});

describe('canHaveAssociates', () => {
  it('is true for SPOC_ADMIN and LIDER only', () => {
    expect(canHaveAssociates(['ASOCIADO', 'LIDER'])).toBe(true);
    expect(canHaveAssociates(['SPOC_ADMIN'])).toBe(true);
    expect(canHaveAssociates(['ASOCIADO', 'ADMIN', 'SPOC_EDIFICIO'])).toBe(false);
  });
});
