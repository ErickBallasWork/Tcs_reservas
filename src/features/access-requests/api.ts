import { apiClient } from '@/api/api-client';
import type {
  AccessRequest,
  AccessRequestPage,
  AccessRequestStatus,
  RoleAssignment,
} from '@/api/types';
import { unwrap } from '@/api/unwrap';

export const ACCESS_REQUESTS_PAGE_SIZE = 10;

export async function fetchAccessRequests(
  status: AccessRequestStatus,
  page: number,
): Promise<AccessRequestPage> {
  return unwrap(
    await apiClient.GET('/access-requests', {
      params: { query: { status, page, pageSize: ACCESS_REQUESTS_PAGE_SIZE } },
    }),
  );
}

export async function approveAccessRequest(
  id: string,
  roles: RoleAssignment[] | undefined,
): Promise<AccessRequest> {
  return unwrap(
    await apiClient.POST('/access-requests/{id}/approve', {
      params: { path: { id } },
      body: { roles },
    }),
  );
}

export async function rejectAccessRequest(id: string, comment: string): Promise<AccessRequest> {
  return unwrap(
    await apiClient.POST('/access-requests/{id}/reject', {
      params: { path: { id } },
      body: { comment },
    }),
  );
}
