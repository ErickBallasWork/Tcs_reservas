'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useResolveSanctions } from '@/features/sanctions/useSanctions';
import { sanctionsLabels as labels } from '@/lib/labels';
import { activeSanctionIds, type SanctionGroup } from '@/lib/sanction-groups';

const MAX_COMMENT_LENGTH = 500;

interface ResolveSanctionDialogProps {
  group: SanctionGroup;
  onClose: () => void;
}

export function ResolveSanctionDialog({ group, onClose }: ResolveSanctionDialogProps) {
  const resolve = useResolveSanctions();
  const [comment, setComment] = useState('');
  const ids = activeSanctionIds(group);
  const canSubmit = comment.trim().length > 0 && !resolve.isPending;

  const handleResolve = () =>
    resolve.mutate({ ids, comment: comment.trim() }, { onSuccess: onClose });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-4 rounded-[14px] p-6 sm:max-w-[480px]">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-bold text-brand">{labels.resolveTitle}</DialogTitle>
          <DialogDescription>
            {group.user.fullName} ({group.user.email}). {labels.resolveIntro(ids.length)}
          </DialogDescription>
        </DialogHeader>
        <label className="field-label">
          {labels.resolveReason}
          <Textarea
            value={comment}
            maxLength={MAX_COMMENT_LENGTH}
            rows={4}
            onChange={(event) => setComment(event.target.value)}
          />
        </label>
        {resolve.isError && (
          <p role="alert" className="font-semibold text-red-700">
            {messageForError(resolve.error)}
          </p>
        )}
        <DialogFooter className="gap-2 sm:flex-row-reverse">
          <button
            type="button"
            className="btn btn-gold"
            disabled={!canSubmit}
            onClick={handleResolve}
          >
            {resolve.isPending ? labels.saving : labels.confirmResolve(ids.length)}
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {labels.cancel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
