'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { AccessRequest } from '@/api/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useRejectAccessRequest } from '@/features/access-requests/useAccessRequests';
import { accessRequestLabels as labels } from '@/lib/labels';

const MAX_COMMENT_LENGTH = 500;

interface RejectDialogProps {
  request: AccessRequest;
  onClose: () => void;
}

export function RejectDialog({ request, onClose }: RejectDialogProps) {
  const reject = useRejectAccessRequest();
  const [comment, setComment] = useState('');
  const canSubmit = comment.trim().length > 0 && !reject.isPending;

  const handleReject = () =>
    reject.mutate({ id: request.id, comment: comment.trim() }, { onSuccess: onClose });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-4 rounded-[14px] p-6 sm:max-w-[480px]">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-bold text-brand">{labels.rejectTitle}</DialogTitle>
          <DialogDescription>
            {request.fullName} ({request.email}). {labels.rejectIntro}
          </DialogDescription>
        </DialogHeader>
        <label className="field-label">
          {labels.rejectReason}
          <Textarea
            value={comment}
            maxLength={MAX_COMMENT_LENGTH}
            rows={4}
            onChange={(event) => setComment(event.target.value)}
          />
        </label>
        {reject.isError && (
          <p role="alert" className="font-semibold text-red-700">
            {messageForError(reject.error)}
          </p>
        )}
        <DialogFooter className="gap-2 sm:flex-row-reverse">
          <button
            type="button"
            className="btn btn-gold"
            disabled={!canSubmit}
            onClick={handleReject}
          >
            {reject.isPending ? labels.saving : labels.confirmReject}
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {labels.cancel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
