import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { availabilityKeys } from '@/features/availability/useAvailability';
import {
  decideApproval,
  decideSeriesApproval,
  fetchPendingApprovals,
  type DecisionBody,
} from '@/features/approvals/api';
import { reservationKeys } from '@/features/reservations/useReservations';

export const approvalKeys = {
  pending: ['approvals', 'pending'] as const,
};

function useRefreshApprovals() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending }),
      queryClient.invalidateQueries({ queryKey: reservationKeys.all }),
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all }),
    ]);
}

export function usePendingApprovals() {
  return useQuery({ queryKey: approvalKeys.pending, queryFn: fetchPendingApprovals });
}

export function useDecideApproval() {
  const refresh = useRefreshApprovals();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: DecisionBody }) => decideApproval(id, body),
    onSettled: refresh,
  });
}

export function useDecideSeriesApproval() {
  const refresh = useRefreshApprovals();
  return useMutation({
    mutationFn: ({ seriesId, body }: { seriesId: string; body: DecisionBody }) =>
      decideSeriesApproval(seriesId, body),
    onSettled: refresh,
  });
}
