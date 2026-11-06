import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SanctionStatus } from '@/api/types';
import { fetchSanctions, resolveSanction } from '@/features/sanctions/api';
import { meKeys } from '@/features/sanctions/useActiveSanction';

export const sanctionKeys = {
  all: ['sanctions'] as const,
  list: (status: SanctionStatus, page: number) => ['sanctions', status, page] as const,
};

export function useSanctions(status: SanctionStatus, page: number) {
  return useQuery({
    queryKey: sanctionKeys.list(status, page),
    queryFn: () => fetchSanctions(status, page),
    placeholderData: keepPreviousData,
  });
}

export function useResolveSanctions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: sanctionKeys.all }),
      queryClient.invalidateQueries({ queryKey: meKeys.all }),
    ]);
  return useMutation({
    mutationFn: async ({ ids, comment }: { ids: readonly string[]; comment: string }) => {
      for (const id of ids) await resolveSanction(id, comment);
    },
    onSettled: refresh,
  });
}
