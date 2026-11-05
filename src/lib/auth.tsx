"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Role } from "@/types";

interface Session {
  email: string;
}

interface AuthContextValue {
  role: Role;
  setRole: (role: Role) => void;
  userName: string;
  session: Session | null;
  ready: boolean; // true once the stored session has been read
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ROLE_KEY = "mock-role";
const SESSION_KEY = "mock-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("associate");
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(ROLE_KEY) as Role | null;
      if (savedRole) setRoleState(savedRole);
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) setSession(JSON.parse(savedSession));
    } catch {}
    setReady(true);
  }, []);

  const setRole = (next: Role) => {
    setRoleState(next);
    try {
      localStorage.setItem(ROLE_KEY, next);
    } catch {}
  };

  const login = useCallback((email: string) => {
    const next = { email };
    setSession(next);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{ role, setRole, userName: "Ana Pérez", session, ready, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}