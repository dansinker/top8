import { PDSRecordManager } from "./pds";
import { CONFIG } from "./config";

export class PDSThemeManager {
	constructor(authManager) {
		if (!authManager) {
			throw new Error("[PDSThemeManager] AuthManager is required");
		}
		this.pds = new PDSRecordManager(authManager);
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

	async initialize() {
		console.debug("[PDSThemeManager] Starting initialization...");

		try {
			// Verify configuration
			if (!CONFIG?.THEME?.RECORD_TYPE || !CONFIG?.THEME?.RECORD_KEY) {
				throw new Error("Theme configuration missing required values");
			}

			// Attempt to fetch theme from PDS
			const record = await this.pds.getRecord(
				CONFIG.THEME.RECORD_TYPE,
				CONFIG.THEME.RECORD_KEY,
			);

			if (!record) {
				console.debug(
					"[PDSThemeManager] No theme record found, creating default",
				);
				await this.setTheme(this.colorThemes[0]);
				return;
			}

			// Validate theme value
			if (!record.theme || !this.colorThemes.includes(record.theme)) {
				console.warn(
					"[PDSThemeManager] Invalid theme in record:",
					record.theme,
				);
				await this.setTheme(this.colorThemes[0]);
				return;
			}

			// Set the theme
			await this.setTheme(record.theme);
		} catch (error) {
			console.error("[PDSThemeManager] Initialization error:", error);
			this.setThemeLocally(this.colorThemes[0]);
		}
	}

	async setTheme(themeName) {
		console.debug("[PDSThemeManager] Setting theme:", themeName);

		try {
			if (!themeName || typeof themeName !== "string") {
				throw new Error("Invalid theme name");
			}

			const normalizedTheme = themeName.trim().toLowerCase();
			if (!this.colorThemes.includes(normalizedTheme)) {
				throw new Error(`Invalid theme: ${normalizedTheme}`);
			}

			// Set theme locally first for immediate feedback
			this.setThemeLocally(normalizedTheme);

			// Prepare record for PDS
			const record = {
				theme: normalizedTheme,
				updatedAt: new Date().toISOString(),
				$type: CONFIG.THEME.RECORD_TYPE,
			};

			// Save to PDS
			await this.pds.putRecord(
				CONFIG.THEME.RECORD_TYPE,
				CONFIG.THEME.RECORD_KEY,
				record,
			);

			return this.getThemeClasses();
		} catch (error) {
			console.error("[PDSThemeManager] Error setting theme:", error);
			throw error;
		}
	}

	setThemeLocally(themeName) {
		// Remove all existing theme classes
		document.body.classList.remove(...this.colorThemes);
		// Add new theme class
		document.body.classList.add(themeName);
		// Update current theme
		this.currentTheme = themeName;
		// Add page-background class if not present
		if (!document.body.classList.contains("page-background")) {
			document.body.classList.add("page-background");
		}
	}

	getThemeClasses() {
		return {
			"page-background": true,
			...this.colorThemes.reduce(
				(acc, theme) => ({
					...acc,
					[theme]: theme === this.currentTheme,
				}),
				{},
			),
		};
	}

	validateTheme(themeName) {
		return this.colorThemes.includes(themeName?.trim()?.toLowerCase());
	}

	choiceClass(themeName) {
		if (!this.validateTheme(themeName)) {
			return { "color-choice": true };
		}
		return {
			"color-choice": true,
			[themeName]: true,
			"ring-2": themeName === this.currentTheme,
			"ring-white": themeName === this.currentTheme,
		};
	}
}
