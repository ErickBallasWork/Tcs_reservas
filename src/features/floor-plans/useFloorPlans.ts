import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateFloorPlanBody, ReplaceFloorZonesBody, UpdateFloorPlanBody } from '@/api/types';
import {
  createFloorPlan,
  fetchFloorPlan,
  fetchFloorPlans,
  fetchFloorPlanStatus,
  patchFloorPlan,
  replaceFloorZones,
} from '@/features/floor-plans/api';
import type { StatusQuery } from '@/lib/floor-plan/plan-window';

export const floorPlanKeys = {
  all: ['floor-plans'] as const,
  statuses: ['floor-plans', 'status'] as const,
  list: (includeInactive: boolean) => ['floor-plans', 'list', includeInactive] as const,
  detail: (id: string) => ['floor-plans', 'detail', id] as const,
  status: (id: string, query: StatusQuery | null) => ['floor-plans', 'status', id, query] as const,
};

export function useFloorPlans(includeInactive = false) {
  return useQuery({
    queryKey: floorPlanKeys.list(includeInactive),
    queryFn: () => fetchFloorPlans(includeInactive),
  });
}

export function useFloorPlan(id: string | undefined) {
  return useQuery({
    queryKey: floorPlanKeys.detail(id ?? ''),
    queryFn: id ? () => fetchFloorPlan(id) : skipToken,
  });
}

export function useFloorPlanStatus(id: string, query: StatusQuery | null) {
  return useQuery({
    queryKey: floorPlanKeys.status(id, query),
    queryFn: query ? () => fetchFloorPlanStatus(id, query) : skipToken,
    placeholderData: keepPreviousData,
  });
}

function useRefreshFloorPlans() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: floorPlanKeys.all });
}

export function useCreateFloorPlan() {
  const refresh = useRefreshFloorPlans();
  return useMutation({
    mutationFn: (body: CreateFloorPlanBody) => createFloorPlan(body),
    onSuccess: refresh,
  });
}

export function useUpdateFloorPlan() {
  const refresh = useRefreshFloorPlans();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateFloorPlanBody }) =>
      patchFloorPlan(id, body),
    onSuccess: refresh,
  });
}

export function useReplaceFloorZones() {
  const refresh = useRefreshFloorPlans();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReplaceFloorZonesBody }) =>
      replaceFloorZones(id, body),
    onSuccess: refresh,
  });
}
