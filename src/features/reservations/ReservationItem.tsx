'use client';

import type { ReservationDetail, ReservationWithApprovals } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { approvalOutcome, type ApprovalOutcome } from '@/lib/approval-outcome';
import { formatRange } from '@/lib/booking-time';
import {
  approvalOutcomeLabels,
  myReservationsLabels as labels,
  purposeLabels,
  reservationStatusLabels,
} from '@/lib/labels';
import {
  canCancelReservation,
  canEditReservation,
  seriesPosition,
  wasReallocated,
} from '@/lib/reservation-actions';

interface ReservationItemProps {
  reservation: ReservationDetail;
  onEdit: (reservation: ReservationWithApprovals) => void;
  onCancel: (reservation: ReservationWithApprovals) => void;
}

function ReallocationNote({ reservation }: { reservation: ReservationDetail }) {
  const latest = reservation.reallocations[0];
  if (!latest) return null;
  const previousRoom = `${latest.previousResource.name} (${latest.previousResource.building.name})`;
  return (
    <small className="flex flex-col text-ink-soft">
      <span>
        {labels.reallocatedBefore(
          previousRoom,
          formatRange(latest.previousStartDateTime, latest.previousEndDateTime),
        )}
      </span>
      <span>{labels.reallocatedReason(latest.justification)}</span>
    </small>
  );
}

function StatusTag({ status }: { status: ReservationWithApprovals['status'] }) {
  const variant =
    status === 'CONFIRMED' || status === 'CHECKED_IN'
      ? 'default'
      : status === 'PENDING_APPROVAL'
        ? 'gold'
        : 'dark';
  return <Tag variant={variant}>{reservationStatusLabels[status]}</Tag>;
}

function ApprovalNote({ outcome }: { outcome: ApprovalOutcome }) {
  if (outcome.kind === 'WAITING') {
    return <small className="text-ink-soft">{approvalOutcomeLabels.waiting}</small>;
  }
  if (outcome.kind === 'EXPIRED') {
    return <small className="text-red-700">{approvalOutcomeLabels.expired}</small>;
  }
  if (outcome.kind === 'APPROVED') {
    return <small className="text-ink-soft">{approvalOutcomeLabels.approvedBy(outcome.by)}</small>;
  }
  return (
    <small className="flex flex-col text-red-700">
      <span>{approvalOutcomeLabels.rejectedBy(outcome.by)}</span>
      {outcome.comments && <span>{approvalOutcomeLabels.reason(outcome.comments)}</span>}
    </small>
  );
}

export function ReservationItem({ reservation, onEdit, onCancel }: ReservationItemProps) {
  const position = seriesPosition(reservation);
  const outcome = approvalOutcome(reservation);
  const editable = canEditReservation(reservation);
  const cancellable = canCancelReservation(reservation);
  const reallocated = wasReallocated(reservation);
  const open = reservation.status === 'CONFIRMED' || reservation.status === 'PENDING_APPROVAL';

  return (
    <li className="panel flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <b className="text-brand">{reservation.resource.name}</b>
          <small className="text-ink-soft">
            {reservation.resource.parent?.name ?? reservation.resource.building.name}
          </small>
        </div>
        <div className="flex flex-wrap gap-2">
          {position && (
            <Tag variant="gold">{labels.seriesBadge(position.index, position.total)}</Tag>
          )}
          {reallocated && <Tag variant="dark">{labels.reallocatedBadge}</Tag>}
          <StatusTag status={reservation.status} />
        </div>
      </div>

      <div className="flex flex-col gap-0.5 text-sm">
        <span>{formatRange(reservation.startDateTime, reservation.endDateTime)}</span>
        <span className="font-medium text-brand">
          {purposeLabels[reservation.purpose]}
          {reservation.attendees !== null && ` · ${labels.attendees(reservation.attendees)}`}
        </span>
        <span className="text-ink-soft">{reservation.justification}</span>
        {outcome && <ApprovalNote outcome={outcome} />}
        {reallocated && <ReallocationNote reservation={reservation} />}
      </div>

      {open && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline flex-1"
            disabled={!editable}
            onClick={() => onEdit(reservation)}
          >
            {labels.edit}
          </button>
          <button
            type="button"
            className="btn btn-outline flex-1"
            disabled={!cancellable}
            onClick={() => onCancel(reservation)}
          >
            {labels.cancel}
          </button>
          {reallocated && cancellable && (
            <small className="w-full text-ink-soft">{labels.reallocatedCancel}</small>
          )}
          {!cancellable && editable && (
            <small className="w-full text-ink-soft">{labels.tooLate}</small>
          )}
        </div>
      )}
    </li>
  );
}
