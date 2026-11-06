import { apiClient } from '@/api/api-client';
import { ApiError } from '@/api/api-error';
import type { ManagedAssociate, ManagedUser, RoleAssignment, UserDevice } from '@/api/types';
import { unwrap } from '@/api/unwrap';

export interface UserChanges {
  isActive?: boolean;
  roles?: RoleAssignment[];
}

export async function fetchUsers(): Promise<ManagedUser[]> {
  return unwrap(await apiClient.GET('/users'));
}

export async function patchUser(id: string, changes: UserChanges): Promise<ManagedUser> {
  return unwrap(await apiClient.PATCH('/users/{id}', { params: { path: { id } }, body: changes }));
}

export async function fetchManagedAssociates(managerId: string): Promise<ManagedAssociate[]> {
  return unwrap(
    await apiClient.GET('/users/{id}/managed-associates', { params: { path: { id: managerId } } }),
  );
}

export async function putManagedAssociates(
  managerId: string,
  associateIds: string[],
): Promise<ManagedAssociate[]> {
  return unwrap(
    await apiClient.PUT('/users/{id}/managed-associates', {
      params: { path: { id: managerId } },
      body: { associateIds },
    }),
  );
}

export async function fetchUserDevices(userId: string): Promise<UserDevice[]> {
  return unwrap(await apiClient.GET('/users/{userId}/devices', { params: { path: { userId } } }));
}

export async function deleteDevice(id: string): Promise<void> {
  const { error, response } = await apiClient.DELETE('/devices/{id}', {
    params: { path: { id } },
  });
  if (error !== undefined) throw ApiError.fromBody(response.status, error);
}
