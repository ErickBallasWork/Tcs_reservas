'use client';

import { messageForError } from '@/api/error-messages';
import type { ManagedUser } from '@/api/types';
import { FeedbackDialog } from '@/components/shared/FeedbackDialog';
import { useUpdateUser } from '@/features/users/useUsers';
import { userLabels as labels } from '@/lib/labels';

interface ToggleActiveDialogProps {
  user: ManagedUser;
  onClose: () => void;
}

export function ToggleActiveDialog({ user, onClose }: ToggleActiveDialogProps) {
  const update = useUpdateUser();
  const deactivating = user.isActive;
  const copy = deactivating ? labels.deactivate : labels.activate;

  const handleConfirm = () =>
    update.mutate({ id: user.id, changes: { isActive: !user.isActive } }, { onSuccess: onClose });

  return (
    <FeedbackDialog
      open
      onOpenChange={(open) => !open && onClose()}
      variant={deactivating ? 'error' : 'info'}
      title={copy.title}
      description={copy.description(user.fullName)}
      footer={
        <>
          <button
            type="button"
            className="btn btn-gold"
            disabled={update.isPending}
            onClick={handleConfirm}
          >
            {update.isPending ? labels.saving : copy.confirm}
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {labels.cancel}
          </button>
        </>
      }
    >
      {update.isError && (
        <p role="alert" className="font-semibold text-red-700">
          {messageForError(update.error)}
        </p>
      )}
    </FeedbackDialog>
  );
}
