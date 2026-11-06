import type { Role, RoleAssignment } from '@/api/types';

export const ASSIGNABLE_ROLES: readonly Role[] = [
  'ASOCIADO',
  'SPOC_ADMIN',
  'LIDER',
  'SPOC_EDIFICIO',
  'ADMIN',
  'SUPERADMIN',
];

const PRIVILEGED_ROLES: readonly Role[] = ['ADMIN', 'SUPERADMIN'];
const MANAGER_ROLES: readonly Role[] = ['SPOC_ADMIN', 'LIDER'];

export function canGrantRole(actorRoles: readonly Role[], role: Role): boolean {
  if (!PRIVILEGED_ROLES.includes(role)) return true;
  return actorRoles.includes('SUPERADMIN');
}

export function hasRole(assignments: readonly RoleAssignment[], role: Role): boolean {
  return assignments.some((assignment) => assignment.role === role);
}

export function toggleRole(assignments: RoleAssignment[], role: Role): RoleAssignment[] {
  if (hasRole(assignments, role)) {
    return assignments.filter((assignment) => assignment.role !== role);
  }
  return [...assignments, { role }];
}

export function setBuilding(
  assignments: RoleAssignment[],
  role: Role,
  buildingId: string,
): RoleAssignment[] {
  return assignments.map((assignment) =>
    assignment.role === role ? { ...assignment, buildingId: buildingId || undefined } : assignment,
  );
}

export function isValidAssignment(assignments: readonly RoleAssignment[]): boolean {
  if (assignments.length === 0) return false;
  return assignments.every(
    (assignment) => assignment.role !== 'SPOC_EDIFICIO' || !!assignment.buildingId,
  );
}

export function canHaveAssociates(roles: readonly Role[]): boolean {
  return roles.some((role) => MANAGER_ROLES.includes(role));
}
