// Theme Manager Class
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
        const storedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
        if (storedTheme && this.colorThemes.includes(storedTheme)) {
            this.setTheme(storedTheme);
        }
    }

    setTheme(themeName) {
        if (!this.colorThemes.includes(themeName)) {
            console.warn("Invalid theme name:", themeName);
            return this.getThemeClasses();
        }

        // Immediately update the current theme
        this.currentTheme = themeName;

        // Save to localStorage synchronously
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, themeName);

        // Return updated classes immediately
        return this.getThemeClasses();
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

    getColorChoiceClass(themeName) {
        return {
            "color-choice": true,
            [themeName]: true,
        };
    }
}
