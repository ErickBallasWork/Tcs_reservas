import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DeviceSession } from '@/api/types';

const api = vi.hoisted(() => ({
  postRefresh: vi.fn(),
  postDeviceSession: vi.fn(),
  postLogout: vi.fn(),
}));
vi.mock('@/features/auth/api', () => api);

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

function deviceSession(overrides: Partial<DeviceSession> = {}): DeviceSession {
  return {
    accessToken: 'access-1',
    tokenType: 'Bearer',
    expiresIn: 900,
    refreshToken: 'refresh-2',
    user: {
      id: 'user-id',
      email: 'ana@tcs.com',
      fullName: 'Ana Pérez',
      roles: ['ASOCIADO'],
      spocBuildingIds: [],
    },
    ...overrides,
  };
}

async function loadModules() {
  vi.resetModules();
  const store = await import('@/features/auth/session-store');
  const token = await import('@/lib/access-token');
  const credentials = await import('@/features/auth/device-credentials');
  const { ApiError } = await import('@/api/api-error');
  return { store, token, credentials, ApiError };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('localStorage', memoryStorage());
  Object.values(api).forEach((mock) => mock.mockReset());
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('restoreSession', () => {
  it('is anonymous when the device has no refresh token', async () => {
    const { store } = await loadModules();

    await store.restoreSession();

    expect(store.getSessionState().status).toBe('anonymous');
    expect(api.postRefresh).not.toHaveBeenCalled();
  });

  it('opens the session, keeps the access token in memory and stores the rotated refresh token', async () => {
    const { store, token, credentials } = await loadModules();
    credentials.writeRefreshToken('refresh-1');
    api.postRefresh.mockResolvedValue(deviceSession());

    await store.restoreSession();

    expect(api.postRefresh).toHaveBeenCalledWith('refresh-1');
    expect(store.getSessionState()).toMatchObject({ status: 'authenticated' });
    expect(store.getSessionState().user?.fullName).toBe('Ana Pérez');
    expect(token.getAccessToken()).toBe('access-1');
    expect(credentials.readRefreshToken()).toBe('refresh-2');
  });

  it('refreshes again a minute before the access token expires', async () => {
    const { store, credentials } = await loadModules();
    credentials.writeRefreshToken('refresh-1');
    api.postRefresh.mockResolvedValue(deviceSession());
    await store.restoreSession();

    await vi.advanceTimersByTimeAsync((900 - 60) * 1000);

    expect(api.postRefresh).toHaveBeenCalledTimes(2);
    expect(api.postRefresh).toHaveBeenLastCalledWith('refresh-2');
  });

  it('drops the credentials and reports why when the server rejects the device', async () => {
    const { store, token, credentials, ApiError } = await loadModules();
    credentials.writeRefreshToken('refresh-1');
    api.postRefresh.mockRejectedValue(new ApiError({ status: 401, code: 'DEVICE_NOT_AUTHORIZED' }));

    await store.restoreSession();

    expect(store.getSessionState()).toEqual({
      status: 'anonymous',
      user: null,
      endedReason: 'DEVICE_NOT_AUTHORIZED',
    });
    expect(credentials.readRefreshToken()).toBeNull();
    expect(token.getAccessToken()).toBeNull();
  });

  it('keeps the credentials and reports the service as unavailable on a network failure', async () => {
    const { store, credentials, ApiError } = await loadModules();
    credentials.writeRefreshToken('refresh-1');
    api.postRefresh.mockRejectedValue(new ApiError({ status: 0, code: 'NETWORK_ERROR' }));

    await store.restoreSession();

    expect(store.getSessionState().status).toBe('unavailable');
    expect(credentials.readRefreshToken()).toBe('refresh-1');
  });

  it('keeps an open session and retries later when a background refresh fails', async () => {
    const { store, token, credentials, ApiError } = await loadModules();
    credentials.writeRefreshToken('refresh-1');
    api.postRefresh.mockResolvedValueOnce(deviceSession());
    await store.restoreSession();
    api.postRefresh.mockRejectedValueOnce(new ApiError({ status: 0, code: 'TIMEOUT' }));

    await vi.advanceTimersByTimeAsync((900 - 60) * 1000);

    expect(store.getSessionState().status).toBe('authenticated');
    expect(token.getAccessToken()).toBe('access-1');
    api.postRefresh.mockResolvedValueOnce(deviceSession({ refreshToken: 'refresh-3' }));
    await vi.advanceTimersByTimeAsync(30_000);
    expect(credentials.readRefreshToken()).toBe('refresh-3');
  });

  it('shares one request between simultaneous restores', async () => {
    const { store, credentials } = await loadModules();
    credentials.writeRefreshToken('refresh-1');
    api.postRefresh.mockResolvedValue(deviceSession());

    await Promise.all([store.restoreSession(), store.restoreSession()]);

    expect(api.postRefresh).toHaveBeenCalledTimes(1);
  });
});

describe('enrollDevice', () => {
  const pending = {
    requestId: '0a4fd1a8-7b3c-4e6e-9f6e-2a7d6f0b2c11',
    deviceSecret: 'a'.repeat(43),
    email: 'ana@tcs.com',
  };

  it('turns an approved request into a session and forgets the request', async () => {
    const { store, credentials } = await loadModules();
    credentials.writePendingRequest(pending);
    api.postDeviceSession.mockResolvedValue(deviceSession());

    await store.enrollDevice(pending);

    expect(api.postDeviceSession).toHaveBeenCalledWith({
      requestId: pending.requestId,
      deviceSecret: pending.deviceSecret,
    });
    expect(store.getSessionState().status).toBe('authenticated');
    expect(credentials.readPendingRequest()).toBeNull();
    expect(credentials.readRefreshToken()).toBe('refresh-2');
  });

  it('keeps the request when the server refuses it', async () => {
    const { store, credentials, ApiError } = await loadModules();
    credentials.writePendingRequest(pending);
    api.postDeviceSession.mockRejectedValue(
      new ApiError({ status: 409, code: 'ACCESS_REQUEST_NOT_APPROVED' }),
    );

    await expect(store.enrollDevice(pending)).rejects.toBeInstanceOf(ApiError);

    expect(credentials.readPendingRequest()).not.toBeNull();
  });
});

describe('endSession', () => {
  it('clears everything locally and revokes the device on the server', async () => {
    const { store, token, credentials } = await loadModules();
    credentials.writeRefreshToken('refresh-1');
    api.postRefresh.mockResolvedValue(deviceSession());
    await store.restoreSession();
    api.postLogout.mockResolvedValue(undefined);

    await store.endSession();

    expect(api.postLogout).toHaveBeenCalledWith('refresh-2');
    expect(store.getSessionState().status).toBe('anonymous');
    expect(token.getAccessToken()).toBeNull();
    expect(credentials.readRefreshToken()).toBeNull();
  });

  it('still logs out locally when the server cannot be reached', async () => {
    const { store, credentials, ApiError } = await loadModules();
    credentials.writeRefreshToken('refresh-1');
    api.postLogout.mockRejectedValue(new ApiError({ status: 0, code: 'NETWORK_ERROR' }));

    await store.endSession();

    expect(store.getSessionState().status).toBe('anonymous');
    expect(credentials.readRefreshToken()).toBeNull();
  });
});
