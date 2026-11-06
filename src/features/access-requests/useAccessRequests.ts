import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AccessRequestStatus, RoleAssignment } from '@/api/types';
import {
  approveAccessRequest,
  fetchAccessRequests,
  rejectAccessRequest,
} from '@/features/access-requests/api';

export const accessRequestKeys = {
  all: ['access-requests'] as const,
  list: (status: AccessRequestStatus, page: number) => ['access-requests', status, page] as const,
};

export function useAccessRequests(status: AccessRequestStatus, page: number) {
  return useQuery({
    queryKey: accessRequestKeys.list(status, page),
    queryFn: () => fetchAccessRequests(status, page),
    placeholderData: keepPreviousData,
  });
}

export function useApproveAccessRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles?: RoleAssignment[] }) =>
      approveAccessRequest(id, roles),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accessRequestKeys.all }),
  });
}

export function useRejectAccessRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      rejectAccessRequest(id, comment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accessRequestKeys.all }),
  });
}
