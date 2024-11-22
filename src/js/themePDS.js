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
			console.debug("[PDSThemeManager] Fetching theme from PDS...");
			const record = await this.pds.getRecord(
				CONFIG.THEME.RECORD_TYPE,
				CONFIG.THEME.RECORD_KEY,
			);

			console.debug("[PDSThemeManager] Retrieved PDS theme record:", record);

			if (!record) {
				console.debug(
					"[PDSThemeManager] No theme record found in PDS, creating default",
				);
				// Create default theme record
				await this.setTheme(this.colorThemes[0]);
				return;
			}

			// Validate theme value
			if (!record.theme || !this.colorThemes.includes(record.theme)) {
				console.warn(
					"[PDSThemeManager] Invalid theme in PDS record:",
					record.theme,
				);
				await this.setTheme(this.colorThemes[0]);
				return;
			}

			// Set the theme
			console.debug("[PDSThemeManager] Setting theme from PDS:", record.theme);
			await this.setTheme(record.theme);

			console.debug("[PDSThemeManager] Theme initialization complete", {
				currentTheme: this.currentTheme,
				recordFound: !!record,
				themeValue: record?.theme,
			});
		} catch (error) {
			console.error("[PDSThemeManager] Initialization error:", {
				error: error.message,
				stack: error.stack,
			});
			// Set default theme on error
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

			// Set theme locally first
			this.setThemeLocally(normalizedTheme);

			// Prepare record for PDS
			const record = {
				theme: normalizedTheme,
				updatedAt: new Date().toISOString(),
				$type: CONFIG.THEME.RECORD_TYPE,
			};

			// Save to PDS
			console.debug("[PDSThemeManager] Saving theme to PDS:", record);
			await this.pds.putRecord(
				CONFIG.THEME.RECORD_TYPE,
				CONFIG.THEME.RECORD_KEY,
				record,
			);

			console.debug("[PDSThemeManager] Theme saved successfully");
			return this.getThemeClasses();
		} catch (error) {
			console.error("[PDSThemeManager] Error setting theme:", {
				error: error.message,
				themeName,
				currentState: this.currentTheme,
			});
			throw error;
		}
	}

	setThemeLocally(themeName) {
		this.currentTheme = themeName;
		document.body.className = themeName;
	}

	getThemeClasses() {
		return this.colorThemes.reduce(
			(acc, theme) => ({
				...acc,
				[theme]: theme === this.currentTheme,
			}),
			{},
		);
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
		};
	}
}
