'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { ManagedUser, RoleAssignment } from '@/api/types';
import { RoleAssignmentField } from '@/components/shared/RoleAssignmentField';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateUser } from '@/features/users/useUsers';
import { useAuth } from '@/lib/auth';
import { userLabels as labels } from '@/lib/labels';
import { isValidAssignment } from '@/lib/role-assignment';

function currentAssignments(user: ManagedUser): RoleAssignment[] {
  return user.roles.map((entry) => ({
    role: entry.role,
    buildingId: entry.buildingId ?? undefined,
  }));
}

interface EditRolesDialogProps {
  user: ManagedUser;
  onClose: () => void;
}

export function EditRolesDialog({ user, onClose }: EditRolesDialogProps) {
  const { roles: actorRoles } = useAuth();
  const update = useUpdateUser();
  const [roles, setRoles] = useState<RoleAssignment[]>(() => currentAssignments(user));
  const canSubmit = isValidAssignment(roles) && !update.isPending;

  const handleSave = () =>
    update.mutate({ id: user.id, changes: { roles } }, { onSuccess: onClose });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-4 rounded-[14px] p-6 sm:max-w-[480px]">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-bold text-brand">
            {labels.editRolesTitle}
          </DialogTitle>
          <DialogDescription>
            {user.fullName} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <RoleAssignmentField value={roles} onChange={setRoles} actorRoles={actorRoles} />
        {update.isError && (
          <p role="alert" className="font-semibold text-red-700">
            {messageForError(update.error)}
          </p>
        )}
        <DialogFooter className="gap-2 sm:flex-row-reverse">
          <button type="button" className="btn btn-gold" disabled={!canSubmit} onClick={handleSave}>
            {update.isPending ? labels.saving : labels.save}
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {labels.cancel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
