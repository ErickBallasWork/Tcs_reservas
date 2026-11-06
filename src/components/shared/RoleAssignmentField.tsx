'use client';

import { useId } from 'react';
import type { Role, RoleAssignment } from '@/api/types';
import { useCatalogTree } from '@/features/catalog/useCatalogTree';
import { roleFieldLabels, roleLabels } from '@/lib/labels';
import {
  ASSIGNABLE_ROLES,
  canGrantRole,
  hasRole,
  setBuilding,
  toggleRole,
} from '@/lib/role-assignment';

interface RoleAssignmentFieldProps {
  value: RoleAssignment[];
  onChange: (value: RoleAssignment[]) => void;
  actorRoles: readonly Role[];
}

export function RoleAssignmentField({ value, onChange, actorRoles }: RoleAssignmentFieldProps) {
  const groupId = useId();
  const buildings = useCatalogTree();
  const spoc = value.find((assignment) => assignment.role === 'SPOC_EDIFICIO');

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 text-[13px] font-semibold">{roleFieldLabels.legend}</legend>
      {ASSIGNABLE_ROLES.map((role) => {
        const disabled = !canGrantRole(actorRoles, role) && !hasRole(value, role);
        return (
          <label
            key={role}
            className="flex min-h-11 items-center gap-3 rounded-lg px-1 text-sm has-disabled:opacity-50"
          >
            <input
              type="checkbox"
              className="size-5 accent-brand"
              checked={hasRole(value, role)}
              disabled={disabled}
              onChange={() => onChange(toggleRole(value, role))}
            />
            {roleLabels[role]}
          </label>
        );
      })}
      {spoc && (
        <label className="field-label mt-1" htmlFor={`${groupId}-building`}>
          {roleFieldLabels.building}
          <select
            id={`${groupId}-building`}
            className="field"
            value={spoc.buildingId ?? ''}
            onChange={(event) => onChange(setBuilding(value, 'SPOC_EDIFICIO', event.target.value))}
          >
            <option value="">{roleFieldLabels.chooseBuilding}</option>
            {buildings.data?.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </fieldset>
  );
}
