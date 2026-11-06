import { ApiError, type ApiErrorCode } from '@/api/api-error';
import type { CurrentUser, DeviceSession } from '@/api/types';
import {
  postDeviceSession,
  postLogout,
  postRefresh,
  postSuperadminLogin,
  type SuperadminCredentials,
} from '@/features/auth/api';
import {
  clearPendingRequest,
  clearRefreshToken,
  type PendingRequest,
  readRefreshToken,
  REFRESH_TOKEN_KEY,
  writeRefreshToken,
} from '@/features/auth/device-credentials';
import { setAccessToken, setUnauthorizedHandler } from '@/lib/access-token';

export type SessionStatus = 'loading' | 'anonymous' | 'authenticated' | 'unavailable';

export interface SessionState {
  status: SessionStatus;
  user: CurrentUser | null;
  endedReason: ApiErrorCode | null;
}

const LOCK_NAME = 'reservas-session-refresh';
const REFRESH_MARGIN_SECONDS = 60;
const MIN_REFRESH_DELAY_MS = 10_000;
const RETRY_DELAY_MS = 30_000;
const MS_PER_SECOND = 1000;

const LOADING: SessionState = { status: 'loading', user: null, endedReason: null };

let state: SessionState = LOADING;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function getSessionState(): SessionState {
  return state;
}

export function getServerSessionState(): SessionState {
  return LOADING;
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setState(next: SessionState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function clearRefreshTimer(): void {
  if (refreshTimer !== null) clearTimeout(refreshTimer);
  refreshTimer = null;
}

function scheduleRefresh(delayMs: number): void {
  clearRefreshTimer();
  refreshTimer = setTimeout(() => void restoreSession(), Math.max(delayMs, MIN_REFRESH_DELAY_MS));
}

function applySession(session: DeviceSession): void {
  writeRefreshToken(session.refreshToken);
  setAccessToken(session.accessToken);
  setState({ status: 'authenticated', user: session.user, endedReason: null });
  scheduleRefresh((session.expiresIn - REFRESH_MARGIN_SECONDS) * MS_PER_SECOND);
}

function becomeAnonymous(reason: ApiErrorCode | null): void {
  clearRefreshTimer();
  setAccessToken(null);
  setState({ status: 'anonymous', user: null, endedReason: reason });
}

function rejectsTheDevice(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

async function runExclusive(task: () => Promise<void>): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    await navigator.locks.request(LOCK_NAME, task);
    return;
  }
  await task();
}

async function performRestore(): Promise<void> {
  const refreshToken = readRefreshToken();
  if (!refreshToken) {
    becomeAnonymous(null);
    return;
  }
  try {
    applySession(await postRefresh(refreshToken));
  } catch (error) {
    if (rejectsTheDevice(error)) {
      clearRefreshToken();
      becomeAnonymous(error instanceof ApiError ? error.code : null);
      return;
    }
    if (state.status === 'authenticated') scheduleRefresh(RETRY_DELAY_MS);
    else setState({ status: 'unavailable', user: null, endedReason: null });
  }
}

export function restoreSession(): Promise<void> {
  inFlight ??= runExclusive(performRestore).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export async function enrollDevice(pending: PendingRequest): Promise<void> {
  const session = await postDeviceSession({
    requestId: pending.requestId,
    deviceSecret: pending.deviceSecret,
  });
  clearPendingRequest();
  applySession(session);
}

export async function signInAsSuperadmin(credentials: SuperadminCredentials): Promise<void> {
  applySession(await postSuperadminLogin(credentials));
}

export async function endSession(): Promise<void> {
  const refreshToken = readRefreshToken();
  clearRefreshToken();
  becomeAnonymous(null);
  if (!refreshToken) return;
  try {
    await postLogout(refreshToken);
  } catch {
    return;
  }
}

function handleStorageChange(event: StorageEvent): void {
  if (event.key === REFRESH_TOKEN_KEY && event.newValue === null) becomeAnonymous(null);
}

export function startSession(): () => void {
  setUnauthorizedHandler(() => {
    if (state.status === 'authenticated') void restoreSession();
  });
  window.addEventListener('storage', handleStorageChange);
  void restoreSession();
  return () => {
    setUnauthorizedHandler(null);
    window.removeEventListener('storage', handleStorageChange);
    clearRefreshTimer();
  };
}
