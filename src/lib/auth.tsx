'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { readStorageItem, subscribeToStorage, writeStorageItem } from '@/lib/browser-storage';
import { roleLabels } from '@/lib/labels';
import type { Role } from '@/api/types';

interface Session {
  email: string;
}

interface AuthContextValue {
  role: Role;
  setRole: (role: Role) => void;
  userName: string;
  session: Session | null;
  ready: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ROLE_KEY = 'mock-role';
const SESSION_KEY = 'mock-session';
const DEFAULT_ROLE: Role = 'ASOCIADO';

function isRole(value: string | null): value is Role {
  return value !== null && Object.hasOwn(roleLabels, value);
}

function parseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value === 'object' && value !== null && 'email' in value) {
      const { email } = value;
      if (typeof email === 'string') return { email };
    }
    return null;
  } catch {
    return null;
  }
}

function useStorageItem(key: string): string | null {
  return useSyncExternalStore(
    subscribeToStorage,
    () => readStorageItem(key),
    () => null,
  );
}

function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToStorage,
    () => true,
    () => false,
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storedRole = useStorageItem(ROLE_KEY);
  const storedSession = useStorageItem(SESSION_KEY);
  const ready = useHydrated();

  const role = isRole(storedRole) ? storedRole : DEFAULT_ROLE;
  const session = useMemo(() => parseSession(storedSession), [storedSession]);

  const setRole = useCallback((next: Role) => writeStorageItem(ROLE_KEY, next), []);
  const login = useCallback(
    (email: string) => writeStorageItem(SESSION_KEY, JSON.stringify({ email })),
    [],
  );
  const logout = useCallback(() => writeStorageItem(SESSION_KEY, null), []);

  return (
    <AuthContext.Provider
      value={{ role, setRole, userName: 'Ana Pérez', session, ready, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
