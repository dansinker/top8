// Theme component registration
document.addEventListener("alpine:init", () => {
    Alpine.data("theme", () => ({
        colorThemes: [],
        themeClass: {},
        currentTheme: null,

        async init() {
            this.colorThemes = window.managers.themeManager.colorThemes;
            // Set a default theme immediately
            this.themeClass = window.managers.themeManager.getThemeClasses();
            document.body.className =
                window.managers.themeManager.colorThemes[0];

            // If we have a logged-in user, initialize their theme
            const storedPerson = Alpine.store("person");
            if (storedPerson?.bsky_handle) {
                try {
                    await window.managers.themeManager.initialize();
                    this.themeClass =
                        window.managers.themeManager.getThemeClasses();
                } catch (error) {
                    console.error("Failed to initialize theme:", error);
                }
            }
        },

        validateTheme(themeName) {
            return window.managers.themeManager.validateTheme(themeName);
        },

        choiceClass(themeName) {
            return window.managers.themeManager.choiceClass(themeName);
        },

        async changeTheme(themeName) {
            try {
                const result =
                    await window.managers.themeManager.setTheme(themeName);
                this.themeClass = result;
            } catch (error) {
                console.error("Failed to change theme:", error);
            }
        },
    }));
});
