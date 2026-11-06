'use client';

import { useState } from 'react';
import type { PendingApproval } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { ApprovalDetails, DecisionButtons } from '@/features/approvals/ApprovalCard';
import { formatRange } from '@/lib/booking-time';
import { approvalsLabels as labels } from '@/lib/labels';
import type { SeriesGroup } from '@/lib/pending-approvals';

interface SeriesApprovalCardProps {
  group: SeriesGroup;
  onApproveAll: (group: SeriesGroup) => void;
  onRejectAll: (group: SeriesGroup) => void;
  onApproveOne: (reservation: PendingApproval) => void;
  onRejectOne: (reservation: PendingApproval) => void;
}

export function SeriesApprovalCard({
  group,
  onApproveAll,
  onRejectAll,
  onApproveOne,
  onRejectOne,
}: SeriesApprovalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [first] = group.items;
  if (!first) return null;
  const count = group.items.length;

  return (
    <li className="panel flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <b className="truncate text-brand">{first.resource.name}</b>
          <small className="truncate text-ink-soft">
            {labels.requestedBy(first.user.fullName)}
          </small>
        </div>
        <Tag variant="gold">{labels.seriesSummary(count, group.seriesTotal)}</Tag>
      </div>
      <ApprovalDetails reservation={first} />
      <DecisionButtons
        approveLabel={labels.approveAll(count)}
        rejectLabel={labels.rejectAll(count)}
        onApprove={() => onApproveAll(group)}
        onReject={() => onRejectAll(group)}
      />
      <button
        type="button"
        className="self-start text-sm font-bold text-brand underline"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? labels.hideDates : labels.showDates}
      </button>
      {expanded && (
        <ul className="flex flex-col gap-2 border-t border-line pt-3">
          {group.items.map((reservation) => (
            <li
              key={reservation.id}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm">
                {reservation.occurrenceIndex !== null &&
                  `${labels.seriesBadge(reservation.occurrenceIndex, group.seriesTotal)} · `}
                {formatRange(reservation.startDateTime, reservation.endDateTime)}
              </span>
              <DecisionButtons
                onApprove={() => onApproveOne(reservation)}
                onReject={() => onRejectOne(reservation)}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
