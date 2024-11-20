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

    async initialize() {
        const storedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
        if (storedTheme && this.colorThemes.includes(storedTheme)) {
            await this.setTheme(storedTheme);
        }
    }

    async setTheme(themeName) {
        if (!this.colorThemes.includes(themeName)) {
            throw new Error("Invalid theme name");
        }

        this.currentTheme = themeName;
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, themeName);
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
