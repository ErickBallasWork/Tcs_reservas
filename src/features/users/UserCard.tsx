import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ManagedUser, Role } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { roleLabels, userLabels as labels } from '@/lib/labels';
import { canHaveAssociates, canManageUser } from '@/lib/role-assignment';

const DATE_FORMAT = 'd MMM yyyy, HH:mm';

export type UserAction = 'roles' | 'toggle' | 'associates' | 'devices';

interface UserCardProps {
  user: ManagedUser;
  actorRoles: readonly Role[];
  onAction: (action: UserAction, user: ManagedUser) => void;
}

export function UserCard({ user, actorRoles, onAction }: UserCardProps) {
  const userRoles = user.roles.map((entry) => entry.role);
  const manageable = canManageUser(actorRoles, userRoles);
  const isSuperadmin = actorRoles.includes('SUPERADMIN');

  return (
    <li className="panel flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{user.fullName}</p>
          <p className="truncate text-sm text-ink-soft">{user.email}</p>
        </div>
        <Tag variant={user.isActive ? 'default' : 'gold'}>
          {user.isActive ? labels.active : labels.inactive}
        </Tag>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {userRoles.map((role) => (
          <Tag key={role} variant={role === 'SUPERADMIN' || role === 'ADMIN' ? 'dark' : 'default'}>
            {roleLabels[role]}
          </Tag>
        ))}
      </div>
      <p className="text-sm text-ink-soft">
        {user.lastLoginAt
          ? labels.lastLogin(format(new Date(user.lastLoginAt), DATE_FORMAT, { locale: es }))
          : labels.neverLoggedIn}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        {isSuperadmin && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => onAction('devices', user)}
          >
            {labels.devices}
          </button>
        )}
        {manageable && canHaveAssociates(userRoles) && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => onAction('associates', user)}
          >
            {labels.associates}
          </button>
        )}
        {manageable && (
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onAction('toggle', user)}
            >
              {user.isActive ? labels.deactivate.action : labels.activate.action}
            </button>
            <button type="button" className="btn btn-gold" onClick={() => onAction('roles', user)}>
              {labels.editRoles}
            </button>
          </>
        )}
      </div>
    </li>
  );
}
