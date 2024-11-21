// src/lib/services/auth.ts
export interface Profile {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
}

export interface AuthSession {
    profile: Profile;
    accessJwt: string;
    refreshJwt: string;
}

export class AuthError extends Error {
    constructor(
        message: string,
        public code: string,
    ) {
        super(message);
        this.name = "AuthError";
    }
}

const API_BASE = "https://bsky.social/xrpc";
const STORAGE_KEY = "auth_session";

class AuthService {
    async createSession(
        identifier: string,
        password: string,
    ): Promise<AuthSession> {
        try {
            const response = await fetch(
                `${API_BASE}/com.atproto.server.createSession`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier, password }),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                throw new AuthError(
                    error.message || "Authentication failed",
                    error.error || "UNKNOWN_ERROR",
                );
            }

            const session = await response.json();
            const profile = await this.fetchProfile(
                session.handle,
                session.accessJwt,
            );

            const authSession: AuthSession = {
                profile: {
                    did: profile.did,
                    handle: profile.handle,
                    displayName: profile.displayName,
                    avatar: profile.avatar,
                },
                accessJwt: session.accessJwt,
                refreshJwt: session.refreshJwt,
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(authSession));
            return authSession;
        } catch (error) {
            if (error instanceof AuthError) throw error;
            throw new AuthError(
                error instanceof Error
                    ? error.message
                    : "Failed to create session",
                "SESSION_CREATE_FAILED",
            );
        }
    }

    async fetchProfile(handle: string, accessJwt: string): Promise<Profile> {
        const response = await fetch(
            `${API_BASE}/app.bsky.actor.getProfile?actor=${handle}`,
            {
                headers: { Authorization: `Bearer ${accessJwt}` },
            },
        );

        if (!response.ok) {
            throw new AuthError(
                "Failed to fetch profile",
                "PROFILE_FETCH_FAILED",
            );
        }

        return response.json();
    }

    async validateSession(session: AuthSession): Promise<boolean> {
        try {
            const response = await fetch(
                `${API_BASE}/app.bsky.actor.getProfile?actor=${session.profile.handle}`,
                {
                    headers: { Authorization: `Bearer ${session.accessJwt}` },
                },
            );
            return response.ok;
        } catch {
            return false;
        }
    }

    async loadSession(): Promise<AuthSession | null> {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;

            const session: AuthSession = JSON.parse(stored);
            const isValid = await this.validateSession(session);

            if (!isValid) {
                this.clearSession();
                return null;
            }

            return session;
        } catch {
            this.clearSession();
            return null;
        }
    }

    clearSession() {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const authService = new AuthService();
