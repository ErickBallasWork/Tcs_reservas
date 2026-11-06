import { apiClient } from '@/api/api-client';
import { ApiError } from '@/api/api-error';
import type { DeviceSession, RequestStatusResponse } from '@/api/types';
import { unwrap } from '@/api/unwrap';

export interface AccessRequestInput {
  email: string;
  fullName: string;
  department?: string;
  deviceSecret: string;
  deviceLabel: string;
}

export interface SuperadminCredentials {
  email: string;
  password: string;
}

export interface DeviceCredential {
  requestId: string;
  deviceSecret: string;
}

export async function postAccessRequest(body: AccessRequestInput): Promise<string> {
  const { requestId } = unwrap(await apiClient.POST('/access-requests', { body }));
  return requestId;
}

export async function fetchAccessRequestStatus(
  body: DeviceCredential,
): Promise<RequestStatusResponse> {
  return unwrap(await apiClient.POST('/access-requests/status', { body }));
}

export async function postDeviceSession(body: DeviceCredential): Promise<DeviceSession> {
  return unwrap(await apiClient.POST('/auth/device-session', { body }));
}

export async function postSuperadminLogin(body: SuperadminCredentials): Promise<DeviceSession> {
  return unwrap(await apiClient.POST('/auth/superadmin-login', { body }));
}

export async function postRefresh(refreshToken: string): Promise<DeviceSession> {
  return unwrap(await apiClient.POST('/auth/refresh', { body: { refreshToken } }));
}

export async function postLogout(refreshToken: string): Promise<void> {
  const { error, response } = await apiClient.POST('/auth/logout', { body: { refreshToken } });
  if (error !== undefined) throw ApiError.fromBody(response.status, error);
}
