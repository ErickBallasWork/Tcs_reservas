import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteDevice,
  fetchManagedAssociates,
  fetchUserDevices,
  fetchUsers,
  patchUser,
  putManagedAssociates,
  type UserChanges,
} from '@/features/users/api';

export const userKeys = {
  all: ['users'] as const,
  associates: (managerId: string) => ['users', managerId, 'managed-associates'] as const,
  devices: (userId: string) => ['users', userId, 'devices'] as const,
};

export function useUsers() {
  return useQuery({ queryKey: userKeys.all, queryFn: fetchUsers });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UserChanges }) => patchUser(id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useManagedAssociates(managerId: string) {
  return useQuery({
    queryKey: userKeys.associates(managerId),
    queryFn: () => fetchManagedAssociates(managerId),
  });
}

export function useReplaceManagedAssociates(managerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (associateIds: string[]) => putManagedAssociates(managerId, associateIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.associates(managerId) }),
  });
}

export function useUserDevices(userId: string) {
  return useQuery({ queryKey: userKeys.devices(userId), queryFn: () => fetchUserDevices(userId) });
}

export function useRevokeDevice(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.devices(userId) }),
  });
}
