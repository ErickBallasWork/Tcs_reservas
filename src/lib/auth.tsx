"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Role } from "@/types";

interface AuthContextValue {
    role: Role;
    setRole: (role: Role) => void;
    userName: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "mock-role";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [role, setRoleState] = useState<Role>("associate");

    useEffect(() => {
        try {
        const saved = localStorage.getItem(STORAGE_KEY) as Role | null;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (saved) setRoleState(saved);
        } catch {}
    }, []);

    const setRole = (next: Role) => {
        setRoleState(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {}
    };

    return (
        <AuthContext.Provider value={{ role, setRole, userName: "Ana Pérez" }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}