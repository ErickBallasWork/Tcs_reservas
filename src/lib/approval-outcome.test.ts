import { describe, expect, it } from 'vitest';
import type { ReservationWithApprovals } from '@/api/types';
import { approvalOutcome } from '@/lib/approval-outcome';

type Subject = Pick<ReservationWithApprovals, 'purpose' | 'status' | 'approvals'>;

const decision = (status: 'APPROVED' | 'REJECTED', comments: string | null = null) => ({
  id: 'a1',
  reservationId: 'r1',
  approverId: 'u1',
  status,
  comments,
  decisionDate: '2026-11-10T12:00:00.000Z',
  approver: { fullName: 'Ana Líder' },
});

const training = (overrides: Partial<Subject> = {}): Subject => ({
  purpose: 'TRAINING',
  status: 'CONFIRMED',
  approvals: [],
  ...overrides,
});

describe('approvalOutcome', () => {
  it('has nothing to say about reservations that need no approval', () => {
    expect(approvalOutcome(training({ purpose: 'INTERNAL_MEETING' }))).toBeNull();
  });

  it('waits for the leader while the reservation is pending', () => {
    expect(approvalOutcome(training({ status: 'PENDING_APPROVAL' }))).toEqual({ kind: 'WAITING' });
  });

  it('keeps waiting after an edit sends an approved reservation back to pending', () => {
    const outcome = approvalOutcome(
      training({ status: 'PENDING_APPROVAL', approvals: [decision('APPROVED')] }),
    );

    expect(outcome).toEqual({ kind: 'WAITING' });
  });

  it('shows who approved a confirmed training', () => {
    expect(approvalOutcome(training({ approvals: [decision('APPROVED')] }))).toMatchObject({
      kind: 'APPROVED',
      by: 'Ana Líder',
    });
  });

  it('shows who rejected and why', () => {
    const outcome = approvalOutcome(
      training({ status: 'REJECTED', approvals: [decision('REJECTED', 'Sin cupo')] }),
    );

    expect(outcome).toMatchObject({ kind: 'REJECTED', by: 'Ana Líder', comments: 'Sin cupo' });
  });

  it('flags a rejection without any decision as expired', () => {
    expect(approvalOutcome(training({ status: 'REJECTED' }))).toEqual({ kind: 'EXPIRED' });
  });

  it('uses the latest decision', () => {
    const outcome = approvalOutcome(
      training({ approvals: [decision('APPROVED'), decision('REJECTED', 'viejo')] }),
    );

    expect(outcome).toMatchObject({ kind: 'APPROVED' });
  });

  it('says nothing about a cancelled training that was approved', () => {
    expect(
      approvalOutcome(training({ status: 'CANCELLED', approvals: [decision('APPROVED')] })),
    ).toBeNull();
  });
});
