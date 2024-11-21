// src/lib/theme/theme-context.tsx
"use client";

import {
	createContext,
	useContext,
	ReactNode,
	useState,
	useEffect,
	useCallback,
} from "react";
import { useAuth } from "@/lib/auth/auth-context";

// Configuration
const CONFIG = {
	THEME: {
		RECORD_TYPE: "app.top8.theme",
		RECORD_KEY: "self",
	},
};

type ThemeName =
	| "pink"
	| "dark-blue"
	| "almond"
	| "vampire"
	| "toxic"
	| "shoes"
	| "angels"
	| "night"
	| "pastel";

interface ThemeContextType {
	theme: ThemeName;
	setTheme: (theme: ThemeName) => Promise<void>;
	themes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: ThemeName[] = [
	"pink",
	"dark-blue",
	"almond",
	"vampire",
	"toxic",
	"shoes",
	"angels",
	"night",
	"pastel",
];

// Theme definitions with correct image paths
const themeProperties = {
	pink: {
		background: "rgb(232, 177, 227, 0.6)",
		header: "#da03d0",
		text: "#2b0425",
		logobox: "#740764",
		backgroundImage: "/images/390g.gif",
	},
	"dark-blue": {
		background: "#172a3a80",
		header: "white",
		text: "#eee",
		logobox: "#0d1589",
		backgroundImage: "/images/4f.gif",
	},
	almond: {
		background: "#d9c5b290",
		header: "#c57d00",
		text: "#000000",
		logobox: "#764d05",
		backgroundImage: "/images/169b.jpg",
	},
	vampire: {
		background: "#00000080",
		header: "#6e0505",
		text: "#f5efef",
		logobox: "#6e0505",
		backgroundImage: "/images/206c.gif",
	},
	toxic: {
		background: "#e5ff00b6",
		header: "#0b6533",
		text: "#000000",
		logobox: "#073e1a",
		backgroundImage: "/images/215b.gif",
	},
	shoes: {
		background: "#ff00f7b6",
		header: "#000000",
		text: "#afef9b",
		logobox: "#ff00f7b6",
		backgroundImage: "/images/176z.gif",
	},
	angels: {
		background: "#98e1f3b6",
		header: "#acf3ccc8",
		text: "#3a0d30",
		logobox: "#acf3ccc4",
		backgroundImage: "/images/76a.jpg",
	},
	night: {
		background: "#3a0d30",
		header: "#bb4100",
		text: "#afafaf",
		logobox: "#bb4100",
		backgroundImage: "/images/1128n.gif",
	},
	pastel: {
		background: "#ffd4f6",
		header: "#65335c",
		text: "#afafaf",
		logobox: "#65335c",
		backgroundImage: "/images/639d.jpg",
	},
};

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<ThemeName>("pink");
	const { accessJwt, profile, isAuthenticated } = useAuth();

	const applyTheme = useCallback((themeName: ThemeName) => {
		const colors = themeProperties[themeName];
		const root = document.documentElement;
		const body = document.body;

		// Set CSS custom properties
		root.style.setProperty("--background-color", colors.background);
		root.style.setProperty("--header-color", colors.header);
		root.style.setProperty("--font-color", colors.text);
		root.style.setProperty("--logobox-color", colors.logobox);

		// Apply background image to body
		body.style.backgroundImage = `url(${colors.backgroundImage})`;
		body.style.backgroundAttachment = "fixed";
		body.style.backgroundRepeat = "repeat";

		// Set theme class on body
		body.className = themeName;
	}, []);

	// Save theme to ATP
	const saveThemeToATP = useCallback(
		async (themeName: ThemeName) => {
			if (!accessJwt || !profile?.did) return;

			try {
				const record = {
					theme: themeName,
					updatedAt: new Date().toISOString(),
					$type: CONFIG.THEME.RECORD_TYPE,
				};

				const response = await fetch(
					"https://bsky.social/xrpc/com.atproto.repo.putRecord",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${accessJwt}`,
						},
						body: JSON.stringify({
							repo: profile.did,
							collection: CONFIG.THEME.RECORD_TYPE,
							rkey: CONFIG.THEME.RECORD_KEY,
							record,
						}),
					},
				);

				if (!response.ok) {
					throw new Error("Failed to save theme to ATP");
				}
			} catch (error) {
				console.error("Error saving theme to ATP:", error);
			}
		},
		[accessJwt, profile?.did],
	);

	// Load theme from ATP
	const loadThemeFromATP = useCallback(async () => {
		if (!accessJwt || !profile?.did) return null;

		try {
			const response = await fetch(
				`https://bsky.social/xrpc/com.atproto.repo.getRecord?${new URLSearchParams(
					{
						repo: profile.did,
						collection: CONFIG.THEME.RECORD_TYPE,
						rkey: CONFIG.THEME.RECORD_KEY,
					},
				)}`,
				{
					headers: {
						Authorization: `Bearer ${accessJwt}`,
					},
				},
			);

			if (response.ok) {
				const data = await response.json();
				if (data?.value?.theme && themes.includes(data.value.theme)) {
					return data.value.theme as ThemeName;
				}
			}
		} catch (error) {
			console.error("Error loading theme from ATP:", error);
		}
		return null;
	}, [accessJwt, profile?.did]);

	const setTheme = useCallback(
		async (newTheme: ThemeName) => {
			setThemeState(newTheme);
			applyTheme(newTheme);

			// Save to both localStorage and ATP
			localStorage.setItem("theme", newTheme);
			if (isAuthenticated) {
				await saveThemeToATP(newTheme);
			}
		},
		[applyTheme, isAuthenticated, saveThemeToATP],
	);

	// Initialize theme
	useEffect(() => {
		const initializeTheme = async () => {
			let initialTheme: ThemeName | null = null;

			// Try to load theme from ATP first if authenticated
			if (isAuthenticated) {
				initialTheme = await loadThemeFromATP();
			}

			// Fall back to localStorage if no ATP theme
			if (!initialTheme) {
				const stored = localStorage.getItem("theme") as ThemeName | null;
				initialTheme = stored && themes.includes(stored) ? stored : "pink";
			}

			setThemeState(initialTheme);
			applyTheme(initialTheme);
		};

		initializeTheme();
	}, [isAuthenticated, loadThemeFromATP, applyTheme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme, themes }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
