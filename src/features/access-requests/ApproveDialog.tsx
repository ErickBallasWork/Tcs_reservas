'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { AccessRequest, RoleAssignment } from '@/api/types';
import { RoleAssignmentField } from '@/components/shared/RoleAssignmentField';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApproveAccessRequest } from '@/features/access-requests/useAccessRequests';
import { useAuth } from '@/lib/auth';
import { accessRequestLabels as labels } from '@/lib/labels';
import { isValidAssignment } from '@/lib/role-assignment';

interface ApproveDialogProps {
  request: AccessRequest;
  onClose: () => void;
}

export function ApproveDialog({ request, onClose }: ApproveDialogProps) {
  const { roles: actorRoles } = useAuth();
  const approve = useApproveAccessRequest();
  const [roles, setRoles] = useState<RoleAssignment[]>([{ role: 'ASOCIADO' }]);
  const isNewUser = request.kind === 'NEW_USER';
  const canSubmit = !approve.isPending && (!isNewUser || isValidAssignment(roles));

  const handleApprove = () =>
    approve.mutate(
      { id: request.id, roles: isNewUser ? roles : undefined },
      { onSuccess: onClose },
    );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-4 rounded-[14px] p-6 sm:max-w-[480px]">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-bold text-brand">{labels.approveTitle}</DialogTitle>
          <DialogDescription>
            {isNewUser
              ? labels.approveNewUser(request.fullName, request.email)
              : labels.approveNewDevice(request.fullName, request.email)}
          </DialogDescription>
        </DialogHeader>
        {isNewUser && (
          <RoleAssignmentField value={roles} onChange={setRoles} actorRoles={actorRoles} />
        )}
        {approve.isError && (
          <p role="alert" className="font-semibold text-red-700">
            {messageForError(approve.error)}
          </p>
        )}
        <DialogFooter className="gap-2 sm:flex-row-reverse">
          <button
            type="button"
            className="btn btn-gold"
            disabled={!canSubmit}
            onClick={handleApprove}
          >
            {approve.isPending ? labels.saving : labels.confirmApprove}
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {labels.cancel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
