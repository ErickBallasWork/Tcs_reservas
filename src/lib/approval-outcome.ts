import type { ReservationWithApprovals } from '@/api/types';

export type ApprovalOutcome =
  | { kind: 'WAITING' }
  | { kind: 'EXPIRED' }
  | { kind: 'APPROVED'; by: string; at: string }
  | { kind: 'REJECTED'; by: string; at: string; comments: string | null };

export function approvalOutcome(
  reservation: Pick<ReservationWithApprovals, 'purpose' | 'status' | 'approvals'>,
): ApprovalOutcome | null {
  if (reservation.purpose !== 'TRAINING') return null;
  if (reservation.status === 'PENDING_APPROVAL') return { kind: 'WAITING' };
  const [latest] = reservation.approvals;
  if (!latest) return reservation.status === 'REJECTED' ? { kind: 'EXPIRED' } : null;
  if (latest.status === 'REJECTED') {
    return {
      kind: 'REJECTED',
      by: latest.approver.fullName,
      at: latest.decisionDate,
      comments: latest.comments,
    };
  }
  if (reservation.status === 'REJECTED' || reservation.status === 'CANCELLED') return null;
  return { kind: 'APPROVED', by: latest.approver.fullName, at: latest.decisionDate };
}
