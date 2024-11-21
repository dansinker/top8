// src/lib/auth/auth-context.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuthState } from "@/lib/hooks/useAuthState";
import { Profile } from "@/lib/services/auth";
import { AuthLoading } from "@/components/auth/auth-loading";

interface AuthContextValue {
    isAuthenticated: boolean;
    profile: Profile | null;
    accessJwt: string | null;
    loading: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuthState();

    if (auth.loading) {
        return <AuthLoading />;
    }

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
