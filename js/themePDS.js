class PDSThemeManager extends ThemeManager {
    constructor(authManager) {
            super();
            if (!authManager) {
                throw new Error('AuthManager is required for PDSThemeManager');
            }
            this.pds = new PDSRecordManager(authManager);
        }

    async initialize() {
        console.debug("[PDSThemeManager] Initializing theme manager...");

        try {
            const superInit = await super.initialize();
            console.debug(
                "[PDSThemeManager] Super initialization complete:",
                superInit,
            );
        } catch (error) {
            console.error(
                "[PDSThemeManager] Failed to initialize parent class:",
                error,
            );
            throw error; // Bubble up critical initialization errors
        }

        try {
            console.debug("[PDSThemeManager] Fetching theme record...");

            if (!CONFIG?.THEME?.RECORD_TYPE || !CONFIG?.THEME?.RECORD_KEY) {
                throw new Error("Invalid theme configuration");
            }

            const record = await this.pds.getRecord(
                CONFIG.THEME.RECORD_TYPE,
                CONFIG.THEME.RECORD_KEY,
            );

            console.debug("[PDSThemeManager] Retrieved theme record:", record);

            if (!record) {
                console.debug(
                    "[PDSThemeManager] No theme record found, using default",
                );
                return;
            }

            if (!record.theme) {
                console.warn(
                    "[PDSThemeManager] Theme record exists but has no theme property",
                );
                return;
            }

            if (!this.colorThemes?.includes(record.theme)) {
                console.warn(
                    "[PDSThemeManager] Retrieved invalid theme:",
                    record.theme,
                );
                return;
            }

            console.debug("[PDSThemeManager] Setting theme to:", record.theme);
            await this.setTheme(record.theme);
            console.debug("[PDSThemeManager] Theme set successfully");
        } catch (error) {
            console.error("[PDSThemeManager] Failed to load PDS theme:", error);
            // Don't throw - theme loading failures are non-critical
        }
    }

    async setTheme(themeName) {
        console.debug(
            "[PDSThemeManager] Attempting to set theme to:",
            themeName,
        );

        if (!themeName) {
            console.error("[PDSThemeManager] Invalid theme name provided");
            throw new Error("Theme name must be provided");
        }

        try {
            console.debug("[PDSThemeManager] Calling parent setTheme method");
            const result = await super.setTheme(themeName);
            console.debug(
                "[PDSThemeManager] Parent setTheme completed with result:",
                result,
            );

            if (!this.currentTheme) {
                console.warn(
                    "[PDSThemeManager] Theme was set but currentTheme is not defined",
                );
                return result;
            }

            if (!CONFIG?.THEME?.RECORD_TYPE || !CONFIG?.THEME?.RECORD_KEY) {
                console.error("[PDSThemeManager] Invalid theme configuration");
                throw new Error("Invalid theme configuration");
            }

            console.debug("[PDSThemeManager] Saving theme preference to PDS");
            const record = {
                theme: this.currentTheme,
                updatedAt: new Date().toISOString(),
            };

            await this.pds.putRecord(
                CONFIG.THEME.RECORD_TYPE,
                CONFIG.THEME.RECORD_KEY,
                record,
            );
            console.debug(
                "[PDSThemeManager] Successfully saved theme preference:",
                record,
            );

            return result;
        } catch (error) {
            console.error(
                "[PDSThemeManager] Failed to set or save theme:",
                error,
            );
            if (error.message === "Invalid theme configuration") {
                throw error; // Re-throw configuration errors
            }
            console.warn(
                "[PDSThemeManager] Continuing despite PDS save failure",
            );
            return false;
        }
    }
}
