'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { ManagedUser } from '@/api/types';
import { DevicesDialog } from '@/features/users/DevicesDialog';
import { EditRolesDialog } from '@/features/users/EditRolesDialog';
import { ManagedAssociatesDialog } from '@/features/users/ManagedAssociatesDialog';
import { ToggleActiveDialog } from '@/features/users/ToggleActiveDialog';
import { UserCard, type UserAction } from '@/features/users/UserCard';
import { useUsers } from '@/features/users/useUsers';
import { useAuth } from '@/lib/auth';
import { userLabels as labels } from '@/lib/labels';
import { matchesSearch } from '@/lib/user-search';

interface OpenAction {
  action: UserAction;
  user: ManagedUser;
}

export function UsersView() {
  const { roles } = useAuth();
  const users = useUsers();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<OpenAction | null>(null);

  const visible = (users.data ?? []).filter((user) => matchesSearch(user, search));
  const close = () => setOpen(null);

  return (
    <div className="flex flex-col gap-4">
      <label className="field-label md:max-w-md">
        {labels.searchLabel}
        <input
          className="field"
          type="search"
          placeholder={labels.searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      {users.isPending && (
        <p role="status" className="flex items-center gap-2">
          <span className="spinner" aria-hidden />
          {labels.loading}
        </p>
      )}

      {users.isError && (
        <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
          <span>{messageForError(users.error)}</span>
          <button type="button" className="btn btn-outline" onClick={() => void users.refetch()}>
            {labels.retry}
          </button>
        </div>
      )}

      {users.isSuccess && visible.length === 0 && (
        <p className="text-ink-soft">{labels.noResults}</p>
      )}

      {visible.length > 0 && (
        <ul className="grid gap-3 xl:grid-cols-2">
          {visible.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              actorRoles={roles}
              onAction={(action, target) => setOpen({ action, user: target })}
            />
          ))}
        </ul>
      )}

      {open?.action === 'roles' && <EditRolesDialog user={open.user} onClose={close} />}
      {open?.action === 'toggle' && <ToggleActiveDialog user={open.user} onClose={close} />}
      {open?.action === 'associates' && (
        <ManagedAssociatesDialog manager={open.user} onClose={close} />
      )}
      {open?.action === 'devices' && <DevicesDialog user={open.user} onClose={close} />}
    </div>
  );
}
