import type { PendingApproval } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { formatRange } from '@/lib/booking-time';
import { approvalsLabels as labels, purposeLabels } from '@/lib/labels';

interface ApprovalDetailsProps {
  reservation: PendingApproval;
}

export function ApprovalDetails({ reservation }: ApprovalDetailsProps) {
  return (
    <div className="flex flex-col gap-0.5 text-sm">
      <span>{formatRange(reservation.startDateTime, reservation.endDateTime)}</span>
      <span className="font-medium text-brand">
        {reservation.resource.parent?.name ?? reservation.resource.building.name}
        {reservation.attendees !== null && ` · ${labels.attendees(reservation.attendees)}`}
      </span>
      <span className="text-ink-soft">{reservation.justification}</span>
    </div>
  );
}

interface DecisionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  approveLabel?: string;
  rejectLabel?: string;
}

export function DecisionButtons({
  onApprove,
  onReject,
  approveLabel = labels.approve,
  rejectLabel = labels.reject,
}: DecisionButtonsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <button type="button" className="btn btn-outline" onClick={onReject}>
        {rejectLabel}
      </button>
      <button type="button" className="btn btn-gold" onClick={onApprove}>
        {approveLabel}
      </button>
    </div>
  );
}

interface ApprovalCardProps {
  reservation: PendingApproval;
  onApprove: (reservation: PendingApproval) => void;
  onReject: (reservation: PendingApproval) => void;
}

export function ApprovalCard({ reservation, onApprove, onReject }: ApprovalCardProps) {
  return (
    <li className="panel flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <b className="truncate text-brand">{reservation.resource.name}</b>
          <small className="truncate text-ink-soft">
            {labels.requestedBy(reservation.user.fullName)}
          </small>
        </div>
        <Tag variant="gold">{purposeLabels.TRAINING}</Tag>
      </div>
      <ApprovalDetails reservation={reservation} />
      <DecisionButtons
        onApprove={() => onApprove(reservation)}
        onReject={() => onReject(reservation)}
      />
    </li>
  );
}
