import type { ReservationWithApprovals } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { approvalOutcome, type ApprovalOutcome } from '@/lib/approval-outcome';
import { formatRange } from '@/lib/booking-time';
import {
  approvalOutcomeLabels,
  dashboardLabels as labels,
  purposeLabels,
  reservationStatusLabels,
} from '@/lib/labels';

interface DashboardReservationItemProps {
  reservation: ReservationWithApprovals;
}

function statusVariant(status: ReservationWithApprovals['status']) {
  if (status === 'CONFIRMED' || status === 'CHECKED_IN') return 'default';
  return status === 'PENDING_APPROVAL' ? 'gold' : 'dark';
}

function outcomeText(outcome: ApprovalOutcome): string {
  switch (outcome.kind) {
    case 'WAITING':
      return approvalOutcomeLabels.waiting;
    case 'EXPIRED':
      return approvalOutcomeLabels.expired;
    case 'APPROVED':
      return approvalOutcomeLabels.approvedBy(outcome.by);
    case 'REJECTED':
      return [
        approvalOutcomeLabels.rejectedBy(outcome.by),
        outcome.comments && approvalOutcomeLabels.reason(outcome.comments),
      ]
        .filter(Boolean)
        .join(' · ');
  }
}

export function DashboardReservationItem({ reservation }: DashboardReservationItemProps) {
  const outcome = approvalOutcome(reservation);
  return (
    <li className="panel flex flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <b className="text-brand">{reservation.resource.name}</b>
          <small className="text-ink-soft">{labels.requestedBy(reservation.user.fullName)}</small>
        </div>
        <Tag variant={statusVariant(reservation.status)}>
          {reservationStatusLabels[reservation.status]}
        </Tag>
      </div>
      <span className="text-sm">
        {formatRange(reservation.startDateTime, reservation.endDateTime)}
      </span>
      <span className="text-sm font-medium text-brand">{purposeLabels[reservation.purpose]}</span>
      {outcome && <small className="text-ink-soft">{outcomeText(outcome)}</small>}
    </li>
  );
}
