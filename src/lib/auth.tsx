"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Role } from "@/types";
import type { BackendRole, CurrentUser } from "@/types/api";
import {
  api,
  getStoredDemoUser,
  getStoredToken,
  removeStoredDemoUser,
  removeStoredToken,
  setStoredDemoUser,
  setStoredToken,
} from "@/lib/api";

export const BACKEND_TO_FRONTEND_ROLE: Record<BackendRole, Role> = {
  ASOCIADO: "associate",
  ADMIN: "admin",
  SPOC_ADMIN: "admin_spoc",
  LIDER: "knowledge_leader",
  SPOC_EDIFICIO: "building_spoc",
};

export const FRONTEND_TO_BACKEND_ROLE: Record<Role, BackendRole> = {
  associate: "ASOCIADO",
  admin: "ADMIN",
  admin_spoc: "SPOC_ADMIN",
  knowledge_leader: "LIDER",
  building_spoc: "SPOC_EDIFICIO",
};

export interface Session {
  email: string;
}

export interface AuthContextValue {
  role: Role;
  setRole: (role: Role) => void;
  userName: string;
  session: Session | null;
  currentUser: CurrentUser | null;
  ready: boolean;
  login: (email: string) => Promise<void>;
  loginGoogle: (credential: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ROLE_KEY = "mock-role";
const SESSION_KEY = "mock-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("associate");
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [ready, setReady] = useState(false);

  const syncRoleFromUser = useCallback((user: CurrentUser) => {
    const userFrontendRoles = user.roles.map(
      (r) => BACKEND_TO_FRONTEND_ROLE[r] || "associate"
    );

    const savedRole = localStorage.getItem(ROLE_KEY) as Role | null;
    if (savedRole && userFrontendRoles.includes(savedRole)) {
      setRoleState(savedRole);
    } else if (userFrontendRoles.length > 0) {
      const priorityOrder: Role[] = [
        "admin",
        "building_spoc",
        "admin_spoc",
        "knowledge_leader",
        "associate",
      ];
      const preferred =
        priorityOrder.find((p) => userFrontendRoles.includes(p)) ||
        userFrontendRoles[0];
      setRoleState(preferred);
      localStorage.setItem(ROLE_KEY, preferred);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const user = await api.auth.getMe();
      setCurrentUser(user);
      syncRoleFromUser(user);
    } catch {
      // Si la API no responde, se mantiene el estado local
    }
  }, [syncRoleFromUser]);

  useEffect(() => {
    const init = async () => {
      try {
        const savedRole = localStorage.getItem(ROLE_KEY) as Role | null;
        if (savedRole) setRoleState(savedRole);

        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          setSession(parsed);
          setStoredDemoUser(parsed.email);
        }

        const token = getStoredToken();
        const demoEmail = getStoredDemoUser();

        if (token || demoEmail) {
          try {
            const user = await api.auth.getMe();
            setCurrentUser(user);
            syncRoleFromUser(user);
          } catch {
            // Continúa con lo guardado localmente si la API no está disponible
          }
        }
      } catch {}
      setReady(true);
    };

    void init();
  }, [syncRoleFromUser]);

  const setRole = (next: Role) => {
    setRoleState(next);
    try {
      localStorage.setItem(ROLE_KEY, next);
    } catch {}
  };

  const login = useCallback(
    async (email: string) => {
      const normalized = email.trim().toLowerCase();
      try {
        const res = await api.auth.loginDemo(normalized);
        setStoredToken(res.accessToken);
        setStoredDemoUser(normalized);
        setCurrentUser(res.user);
        syncRoleFromUser(res.user);
      } catch {
        setStoredDemoUser(normalized);
      }

      const next = { email: normalized };
      setSession(next);
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      } catch {}
    },
    [syncRoleFromUser]
  );

  const loginGoogle = useCallback(
    async (credential: string) => {
      const res = await api.auth.loginGoogle(credential);
      setStoredToken(res.accessToken);
      setStoredDemoUser(res.user.email);
      setCurrentUser(res.user);
      syncRoleFromUser(res.user);

      const next = { email: res.user.email };
      setSession(next);
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      } catch {}
    },
    [syncRoleFromUser]
  );

  const logout = useCallback(() => {
    setSession(null);
    setCurrentUser(null);
    removeStoredToken();
    removeStoredDemoUser();
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(ROLE_KEY);
    } catch {}
  }, []);

  const userName =
    currentUser?.fullName || (session?.email ? session.email.split("@")[0] : "Ana Pérez");

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        userName,
        session,
        currentUser,
        ready,
        login,
        loginGoogle,
        refreshProfile,
        logout,
      }}
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
