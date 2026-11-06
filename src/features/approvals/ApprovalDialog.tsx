'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { ApprovalDecision, SeriesDecisionResult } from '@/api/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useDecideApproval, useDecideSeriesApproval } from '@/features/approvals/useApprovals';
import { approvalsLabels as labels } from '@/lib/labels';

const MAX_COMMENT_LENGTH = 1000;

export type ApprovalTarget =
  | { kind: 'single'; reservationId: string; resourceName: string; requester: string }
  | { kind: 'series'; seriesId: string; count: number; requester: string };

interface ApprovalDialogProps {
  target: ApprovalTarget;
  decision: ApprovalDecision;
  onClose: () => void;
  onSeriesDecided: (result: SeriesDecisionResult) => void;
}

function describe(target: ApprovalTarget, decision: ApprovalDecision): string {
  if (target.kind === 'series') {
    return decision === 'APPROVE'
      ? labels.approveSeries(target.count, target.requester)
      : labels.rejectSeries(target.count, target.requester);
  }
  return decision === 'APPROVE'
    ? labels.approveSingle(target.resourceName, target.requester)
    : labels.rejectSingle(target.resourceName, target.requester);
}

export function ApprovalDialog({
  target,
  decision,
  onClose,
  onSeriesDecided,
}: ApprovalDialogProps) {
  const single = useDecideApproval();
  const series = useDecideSeriesApproval();
  const [comment, setComment] = useState('');
  const approving = decision === 'APPROVE';
  const mutation = target.kind === 'series' ? series : single;
  const trimmed = comment.trim();
  const canSubmit = !mutation.isPending && (approving || trimmed.length > 0);

  const handleConfirm = () => {
    const body = { decision, comments: trimmed || undefined };
    if (target.kind === 'series') {
      series.mutate(
        { seriesId: target.seriesId, body },
        {
          onSuccess: (result) => {
            onSeriesDecided(result);
            onClose();
          },
        },
      );
      return;
    }
    single.mutate({ id: target.reservationId, body }, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-4 rounded-[14px] p-6 sm:max-w-[480px]">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-bold text-brand">
            {approving ? labels.approveTitle : labels.rejectTitle}
          </DialogTitle>
          <DialogDescription>{describe(target, decision)}</DialogDescription>
        </DialogHeader>
        {!approving && (
          <label className="field-label">
            {labels.reason}
            <Textarea
              value={comment}
              maxLength={MAX_COMMENT_LENGTH}
              rows={4}
              aria-required
              onChange={(event) => setComment(event.target.value)}
            />
            {trimmed.length === 0 && (
              <small className="text-ink-soft">{labels.reasonRequired}</small>
            )}
          </label>
        )}
        {mutation.isError && (
          <p role="alert" className="font-semibold text-red-700">
            {messageForError(mutation.error)}
          </p>
        )}
        <DialogFooter className="gap-2 sm:flex-row-reverse">
          <button
            type="button"
            className="btn btn-gold"
            disabled={!canSubmit}
            onClick={handleConfirm}
          >
            {mutation.isPending ? labels.saving : approving ? labels.approve : labels.reject}
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {labels.cancel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
