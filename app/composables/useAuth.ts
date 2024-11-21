// composables/useAuth.ts
import { reactive, readonly } from "vue";
import { BskyAgent } from "@atproto/api";

interface AuthState {
    agent: BskyAgent | null;
    session: {
        did: string;
        handle: string;
        email: string;
        accessJwt: string;
    } | null;
    isAuthenticated: boolean;
}

const state = reactive<AuthState>({
    agent: null,
    session: null,
    isAuthenticated: false,
});

export function useAuth() {
    const login = async (identifier: string, password: string) => {
        try {
            const agent = new BskyAgent({
                service: "https://bsky.social",
            });
            const { success, data } = await agent.login({
                identifier,
                password,
            });

            if (success && data) {
                state.agent = agent;
                state.session = {
                    did: data.did,
                    handle: data.handle,
                    email: data.email,
                    accessJwt: data.accessJwt,
                };
                state.isAuthenticated = true;

                // Store encrypted session data
                const sessionData = JSON.stringify(state.session);
                localStorage.setItem("top8_session", btoa(sessionData));

                return { success: true };
            }
            return { success: false, error: "Login failed" };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        state.agent = null;
        state.session = null;
        state.isAuthenticated = false;
        localStorage.removeItem("top8_session");
    };

    const initializeFromStorage = async () => {
        const storedSession = localStorage.getItem("top8_session");
        if (storedSession) {
            try {
                const sessionData = JSON.parse(atob(storedSession));
                const agent = new BskyAgent({
                    service: "https://bsky.social",
                });

                await agent.resumeSession(sessionData);

                state.agent = agent;
                state.session = sessionData;
                state.isAuthenticated = true;
            } catch (error) {
                console.error("Failed to restore session:", error);
                await logout();
            }
        }
    };

    return {
        // State (readonly to prevent direct mutations)
        state: readonly(state),

        // Actions
        login,
        logout,
        initializeFromStorage,

        // Computed
        currentUser: () => state.session,
        isLoggedIn: () => state.isAuthenticated,
        getAgent: () => state.agent,
    };
}
