'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { ManagedAssociate, ManagedUser } from '@/api/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useManagedAssociates,
  useReplaceManagedAssociates,
  useUsers,
} from '@/features/users/useUsers';
import { userLabels as labels } from '@/lib/labels';
import { matchesSearch } from '@/lib/user-search';

interface ManagedAssociatesDialogProps {
  manager: ManagedUser;
  onClose: () => void;
}

interface PickerProps {
  manager: ManagedUser;
  current: ManagedAssociate[];
  onClose: () => void;
}

function AssociatesPicker({ manager, current, onClose }: PickerProps) {
  const users = useUsers();
  const replace = useReplaceManagedAssociates(manager.id);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(current.map((a) => a.id)));
  const [search, setSearch] = useState('');

  const candidates = (users.data ?? []).filter(
    (user) => user.id !== manager.id && user.isActive && matchesSearch(user, search),
  );

  const toggle = (id: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <>
      <label className="field-label">
        {labels.searchLabel}
        <input
          className="field"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <p className="text-sm text-ink-soft" aria-live="polite">
        {labels.selectedCount(selected.size)}
      </p>
      <ul className="max-h-64 overflow-y-auto rounded-lg border border-line">
        {candidates.map((user) => (
          <li key={user.id}>
            <label className="flex min-h-11 items-center gap-3 px-3 text-sm">
              <input
                type="checkbox"
                className="size-5 accent-brand"
                checked={selected.has(user.id)}
                onChange={() => toggle(user.id)}
              />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{user.fullName}</span>
                <span className="block truncate text-xs text-ink-soft">{user.email}</span>
              </span>
            </label>
          </li>
        ))}
        {users.isSuccess && candidates.length === 0 && (
          <li className="p-3 text-sm text-ink-soft">{labels.noResults}</li>
        )}
      </ul>
      {replace.isError && (
        <p role="alert" className="font-semibold text-red-700">
          {messageForError(replace.error)}
        </p>
      )}
      <DialogFooter className="gap-2 sm:flex-row-reverse">
        <button
          type="button"
          className="btn btn-gold"
          disabled={replace.isPending}
          onClick={() => replace.mutate([...selected], { onSuccess: onClose })}
        >
          {replace.isPending ? labels.saving : labels.save}
        </button>
        <button type="button" className="btn btn-outline" onClick={onClose}>
          {labels.cancel}
        </button>
      </DialogFooter>
    </>
  );
}

export function ManagedAssociatesDialog({ manager, onClose }: ManagedAssociatesDialogProps) {
  const associates = useManagedAssociates(manager.id);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-4 rounded-[14px] p-6 sm:max-w-[520px]">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-bold text-brand">
            {labels.associatesTitle}
          </DialogTitle>
          <DialogDescription>{labels.associatesIntro(manager.fullName)}</DialogDescription>
        </DialogHeader>
        {associates.isPending && (
          <p role="status" className="flex items-center gap-2">
            <span className="spinner" aria-hidden />
            {labels.loading}
          </p>
        )}
        {associates.isError && (
          <p role="alert" className="font-semibold text-red-700">
            {messageForError(associates.error)}
          </p>
        )}
        {associates.data && (
          <AssociatesPicker manager={manager} current={associates.data} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
