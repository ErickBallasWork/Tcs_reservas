import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateBuildingBody,
  CreateResourceBody,
  UpdateBuildingBody,
  UpdateResourceBody,
} from '@/api/types';
import {
  createBuilding,
  createResource,
  fetchAdminCatalogTree,
  fetchBuildingFutureReservations,
  fetchResourceFutureReservations,
  patchBuilding,
  patchResource,
} from '@/features/catalog/admin/api';
import type { CatalogSubject } from '@/features/catalog/admin/catalog-subject';

export const adminCatalogKeys = {
  tree: ['catalog', 'tree', 'admin'] as const,
  futureReservations: (subject: CatalogSubject, id: string) =>
    ['catalog', 'future-reservations', subject, id] as const,
};

function useRefreshCatalog() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['catalog'] });
}

export function useAdminCatalogTree() {
  return useQuery({ queryKey: adminCatalogKeys.tree, queryFn: fetchAdminCatalogTree });
}

export function useCreateBuilding() {
  const refresh = useRefreshCatalog();
  return useMutation({
    mutationFn: (body: CreateBuildingBody) => createBuilding(body),
    onSuccess: refresh,
  });
}

export function useUpdateBuilding() {
  const refresh = useRefreshCatalog();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBuildingBody }) => patchBuilding(id, body),
    onSuccess: refresh,
  });
}

export function useCreateResource() {
  const refresh = useRefreshCatalog();
  return useMutation({
    mutationFn: (body: CreateResourceBody) => createResource(body),
    onSuccess: refresh,
  });
}

export function useUpdateResource() {
  const refresh = useRefreshCatalog();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateResourceBody }) => patchResource(id, body),
    onSuccess: refresh,
  });
}

export function useToggleActive(subject: CatalogSubject) {
  const updateBuilding = useUpdateBuilding();
  const updateResource = useUpdateResource();
  const mutation = subject === 'BUILDING' ? updateBuilding : updateResource;

  const toggle = (id: string, isActive: boolean, onSuccess: () => void) =>
    subject === 'BUILDING'
      ? updateBuilding.mutate({ id, body: { isActive } }, { onSuccess })
      : updateResource.mutate({ id, body: { isActive } }, { onSuccess });

  return { toggle, isPending: mutation.isPending, error: mutation.error };
}

export function useFutureReservations(subject: CatalogSubject, id: string, enabled: boolean) {
  return useQuery({
    queryKey: adminCatalogKeys.futureReservations(subject, id),
    queryFn: () =>
      subject === 'BUILDING'
        ? fetchBuildingFutureReservations(id)
        : fetchResourceFutureReservations(id),
    enabled,
    staleTime: 0,
    gcTime: 0,
  });
}
