'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { Role } from '@/api/types';
import {
  endSession,
  getServerSessionState,
  getSessionState,
  restoreSession,
  startSession,
  subscribeSession,
} from '@/features/auth/session-store';

const NO_ROLES: readonly Role[] = [];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => startSession(), []);
  return children;
}

export function useAuth() {
  const state = useSyncExternalStore(subscribeSession, getSessionState, getServerSessionState);
  return {
    status: state.status,
    user: state.user,
    roles: state.user?.roles ?? NO_ROLES,
    endedReason: state.endedReason,
    logout: endSession,
    retry: restoreSession,
  };
}
