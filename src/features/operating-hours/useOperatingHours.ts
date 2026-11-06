import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateClosedDateBody, ReplaceOperatingHoursBody } from '@/api/types';
import { availabilityKeys } from '@/features/availability/useAvailability';
import {
  createClosedDate,
  deleteClosedDate,
  fetchClosedDates,
  fetchOperatingHours,
  replaceOperatingHours,
} from '@/features/operating-hours/api';

export const operatingHoursKeys = {
  all: ['operating-hours'] as const,
  scope: (resourceId: string | undefined) => ['operating-hours', resourceId ?? 'global'] as const,
  closedDates: ['operating-hours', 'closed-dates'] as const,
};

function useRefresh() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: operatingHoursKeys.all }),
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all }),
    ]);
}

export function useOperatingHours(resourceId: string | undefined) {
  return useQuery({
    queryKey: operatingHoursKeys.scope(resourceId),
    queryFn: () => fetchOperatingHours(resourceId),
  });
}

export function useReplaceOperatingHours() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (body: ReplaceOperatingHoursBody) => replaceOperatingHours(body),
    onSuccess: refresh,
  });
}

export function useClosedDates() {
  return useQuery({ queryKey: operatingHoursKeys.closedDates, queryFn: fetchClosedDates });
}

export function useCreateClosedDate() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (body: CreateClosedDateBody) => createClosedDate(body),
    onSuccess: refresh,
  });
}

export function useDeleteClosedDate() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (id: string) => deleteClosedDate(id), onSuccess: refresh });
}
