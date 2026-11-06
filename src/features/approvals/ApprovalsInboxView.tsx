'use client';

import { useMemo, useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { ApprovalDecision, PendingApproval, SeriesDecisionResult } from '@/api/types';
import { ApprovalCard } from '@/features/approvals/ApprovalCard';
import { ApprovalDialog, type ApprovalTarget } from '@/features/approvals/ApprovalDialog';
import { SeriesApprovalCard } from '@/features/approvals/SeriesApprovalCard';
import { usePendingApprovals } from '@/features/approvals/useApprovals';
import { approvalsLabels as labels } from '@/lib/labels';
import { groupPendingApprovals, type SeriesGroup } from '@/lib/pending-approvals';

interface PendingDecision {
  target: ApprovalTarget;
  decision: ApprovalDecision;
}

function singleTarget(reservation: PendingApproval): ApprovalTarget {
  return {
    kind: 'single',
    reservationId: reservation.id,
    resourceName: reservation.resource.name,
    requester: reservation.user.fullName,
  };
}

function seriesTarget(group: SeriesGroup): ApprovalTarget {
  return {
    kind: 'series',
    seriesId: group.seriesId,
    count: group.items.length,
    requester: group.items[0]?.user.fullName ?? '',
  };
}

export function ApprovalsInboxView() {
  const pending = usePendingApprovals();
  const [decision, setDecision] = useState<PendingDecision | null>(null);
  const [skipped, setSkipped] = useState(0);
  const entries = useMemo(() => groupPendingApprovals(pending.data ?? []), [pending.data]);

  const handleSeriesDecided = (result: SeriesDecisionResult) => setSkipped(result.skipped);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink-soft">{labels.intro}</p>

      {pending.isPending && (
        <p role="status" className="flex items-center gap-2">
          <span className="spinner" aria-hidden />
          {labels.loading}
        </p>
      )}

      {pending.isError && (
        <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
          <span>{messageForError(pending.error)}</span>
          <button type="button" className="btn btn-outline" onClick={() => void pending.refetch()}>
            {labels.retry}
          </button>
        </div>
      )}

      {skipped > 0 && (
        <div
          role="status"
          className="panel flex items-center justify-between gap-2 border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <span>{labels.seriesSkipped(skipped)}</span>
          <button type="button" className="btn btn-outline" onClick={() => setSkipped(0)}>
            {labels.dismiss}
          </button>
        </div>
      )}

      {pending.data && entries.length === 0 && <p className="text-ink-soft">{labels.empty}</p>}

      {entries.length > 0 && (
        <ul className="grid gap-3 lg:grid-cols-2">
          {entries.map((entry) =>
            entry.kind === 'series' ? (
              <SeriesApprovalCard
                key={entry.key}
                group={entry}
                onApproveAll={(group) =>
                  setDecision({ target: seriesTarget(group), decision: 'APPROVE' })
                }
                onRejectAll={(group) =>
                  setDecision({ target: seriesTarget(group), decision: 'REJECT' })
                }
                onApproveOne={(item) =>
                  setDecision({ target: singleTarget(item), decision: 'APPROVE' })
                }
                onRejectOne={(item) =>
                  setDecision({ target: singleTarget(item), decision: 'REJECT' })
                }
              />
            ) : (
              <ApprovalCard
                key={entry.key}
                reservation={entry.item}
                onApprove={(item) =>
                  setDecision({ target: singleTarget(item), decision: 'APPROVE' })
                }
                onReject={(item) => setDecision({ target: singleTarget(item), decision: 'REJECT' })}
              />
            ),
          )}
        </ul>
      )}

      {decision && (
        <ApprovalDialog
          target={decision.target}
          decision={decision.decision}
          onClose={() => setDecision(null)}
          onSeriesDecided={handleSeriesDecided}
        />
      )}
    </div>
  );
}
