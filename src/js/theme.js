class ThemeManager {
	constructor() {
		this.colorThemes = [
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
		this.currentTheme = null;
	}

	initialize() {
		console.log("[ThemeManager] Initializing theme manager...");

		let storedTheme;
		try {
			// storedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
			console.log("[ThemeManager] Retrieved stored theme:", storedTheme);
		} catch (err) {
			console.error("[ThemeManager] Error accessing localStorage:", err);
			return;
		}

		if (!storedTheme) {
			console.log("[ThemeManager] No stored theme found");
			return;
		}

		if (!this.colorThemes.includes(storedTheme)) {
			console.warn("[ThemeManager] Invalid stored theme:", storedTheme);
			console.log("[ThemeManager] Available themes:", this.colorThemes);
			return;
		}

		console.log("[ThemeManager] Setting valid stored theme:", storedTheme);
		try {
			const result = this.setTheme(storedTheme);
			console.log("[ThemeManager] Theme set successfully:", result);
		} catch (err) {
			console.error("[ThemeManager] Error setting theme:", err);
		}
	}

	setTheme(themeName) {
		console.log("[ThemeManager] Attempting to set theme:", themeName);

		if (!themeName || typeof themeName !== "string") {
			console.error("[ThemeManager] Invalid theme parameter type");
			return this.getThemeClasses();
		}

		const normalizedTheme = themeName.trim().toLowerCase();

		if (!this.colorThemes.includes(normalizedTheme)) {
			console.warn("[ThemeManager] Invalid theme name:", normalizedTheme);
			console.log("[ThemeManager] Available themes:", this.colorThemes);
			return this.getThemeClasses();
		}

		try {
			console.log("[ThemeManager] Updating current theme to:", normalizedTheme);
			this.currentTheme = normalizedTheme;

			console.log("[ThemeManager] Saving theme to localStorage");
			// localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, normalizedTheme);

			// Force body class update
			document.body.className = normalizedTheme;

			const updatedClasses = this.getThemeClasses();
			console.log(
				"[ThemeManager] Theme updated successfully, returning classes:",
				updatedClasses,
			);
			return updatedClasses;
		} catch (error) {
			console.error("[ThemeManager] Error setting theme:", error);
			this.currentTheme = null;
			return this.getThemeClasses();
		}
	}

	getThemeClasses() {
		console.log("[ThemeManager] Getting theme classes...");

		if (!Array.isArray(this.colorThemes)) {
			console.error("[ThemeManager] colorThemes is not an array");
			return {};
		}

		try {
			const themeClasses = this.colorThemes.reduce((acc, theme) => {
				if (typeof theme !== "string") {
					console.warn("[ThemeManager] Invalid theme type:", typeof theme);
					return acc;
				}

				const isActive = theme === this.currentTheme;
				console.log(
					`[ThemeManager] Processing theme '${theme}', active: ${isActive}`,
				);

				return {
					...acc,
					[theme]: isActive,
				};
			}, {});

			console.log("[ThemeManager] Generated theme classes:", themeClasses);
			return themeClasses;
		} catch (error) {
			console.error("[ThemeManager] Error generating theme classes:", error);
			return {};
		}
	}

	getColorChoiceClass(themeName) {
		console.log(
			"[ThemeManager] Getting color choice class for theme:",
			themeName,
		);

		if (!themeName || typeof themeName !== "string") {
			console.error("[ThemeManager] Invalid theme name parameter:", themeName);
			return { "color-choice": true };
		}

		const normalizedTheme = themeName.trim().toLowerCase();

		if (!this.colorThemes.includes(normalizedTheme)) {
			console.warn("[ThemeManager] Invalid theme name:", normalizedTheme);
			console.log("[ThemeManager] Available themes:", this.colorThemes);
			return { "color-choice": true };
		}

		try {
			const classes = {
				"color-choice": true,
				[normalizedTheme]: true,
			};
			console.log("[ThemeManager] Generated color choice classes:", classes);
			return classes;
		} catch (error) {
			console.error(
				"[ThemeManager] Error generating color choice classes:",
				error,
			);
			return { "color-choice": true };
		}
	}
}
