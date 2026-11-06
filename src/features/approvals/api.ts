import { apiClient } from '@/api/api-client';
import type {
  ApprovalDecision,
  PendingApproval,
  ReservationDetail,
  SeriesDecisionResult,
} from '@/api/types';
import { unwrap } from '@/api/unwrap';

export interface DecisionBody {
  decision: ApprovalDecision;
  comments?: string;
}

export async function fetchPendingApprovals(): Promise<PendingApproval[]> {
  return unwrap(await apiClient.GET('/approvals/pending'));
}

export async function decideApproval(
  reservationId: string,
  body: DecisionBody,
): Promise<ReservationDetail> {
  return unwrap(
    await apiClient.POST('/approvals/{reservationId}', {
      params: { path: { reservationId } },
      body,
    }),
  );
}

export async function decideSeriesApproval(
  seriesId: string,
  body: DecisionBody,
): Promise<SeriesDecisionResult> {
  return unwrap(
    await apiClient.POST('/approvals/series/{seriesId}', {
      params: { path: { seriesId } },
      body,
    }),
  );
}
