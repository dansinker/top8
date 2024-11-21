// src/lib/auth/auth-context.tsx
"use client";

import {
	createContext,
	useContext,
	type ReactNode,
	useState,
	useEffect,
	useCallback,
} from "react";

interface Profile {
	did: string;
	handle: string;
	displayName?: string;
	avatar?: string;
}

interface AuthState {
	isAuthenticated: boolean;
	profile: Profile | null;
	accessJwt: string | null;
	refreshJwt: string | null;
}

interface AuthContextType extends AuthState {
	login: (identifier: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth_session";

export function AuthProvider({ children }: { children: ReactNode }) {
	const [authState, setAuthState] = useState<AuthState>({
		isAuthenticated: false,
		profile: null,
		accessJwt: null,
		refreshJwt: null,
	});
	const [isLoading, setIsLoading] = useState(true);

	// Load session from storage
	const loadSession = useCallback(async () => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) {
				setIsLoading(false);
				return;
			}

			const session = JSON.parse(stored);

			// Verify the session is still valid by making a test API call
			const profileResponse = await fetch(
				`https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${session.profile.handle}`,
				{
					headers: {
						Authorization: `Bearer ${session.accessJwt}`,
					},
				},
			);

			if (profileResponse.ok) {
				setAuthState({
					isAuthenticated: true,
					profile: session.profile,
					accessJwt: session.accessJwt,
					refreshJwt: session.refreshJwt,
				});
			} else {
				// If the session is invalid, clear it
				localStorage.removeItem(STORAGE_KEY);
			}
		} catch (error) {
			console.error("Error loading session:", error);
			localStorage.removeItem(STORAGE_KEY);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Check for existing session on mount
	useEffect(() => {
		loadSession();
	}, [loadSession]);

	const login = async (identifier: string, password: string) => {
		try {
			const response = await fetch(
				"https://bsky.social/xrpc/com.atproto.server.createSession",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ identifier, password }),
				},
			);

			if (!response.ok) {
				throw new Error("Authentication failed");
			}

			const data = await response.json();

			// Fetch profile
			const profileResponse = await fetch(
				`https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${data.handle}`,
				{
					headers: {
						Authorization: `Bearer ${data.accessJwt}`,
					},
				},
			);

			if (!profileResponse.ok) {
				throw new Error("Failed to fetch profile");
			}

			const profile = await profileResponse.json();

			const authData = {
				isAuthenticated: true,
				profile: {
					did: profile.did,
					handle: profile.handle,
					displayName: profile.displayName,
					avatar: profile.avatar,
				},
				accessJwt: data.accessJwt,
				refreshJwt: data.refreshJwt,
			};

			setAuthState(authData);
			// Store in localStorage with the consistent key
			localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	};

	const logout = async () => {
		setAuthState({
			isAuthenticated: false,
			profile: null,
			accessJwt: null,
			refreshJwt: null,
		});
		localStorage.removeItem(STORAGE_KEY);
	};

	if (isLoading) {
		return null; // or a loading spinner
	}

	return (
		<AuthContext.Provider value={{ ...authState, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
