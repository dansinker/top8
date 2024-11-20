// Initialize Alpine data with our classes
document.addEventListener("alpine:init", () => {
    // Create instances of our managers
    const authManager = new AuthManager();
    const profileManager = new ProfileManager(authManager);
    const themeManager = new ThemeManager();
    const storageManager = new StorageManager();

    // Register the theme component
    Alpine.data("theme", () => ({
        colorThemes: [],
        themeClass: {},
        currentTheme: null,

        init() {
            // const themeManager = new ThemeManager();
            this.colorThemes = themeManager.colorThemes;

            // Load initial theme
            const storedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);

            if (storedTheme && this.colorThemes.includes(storedTheme)) {
                this.changeTheme(storedTheme);
            }
        },

        choiceClass(themeName) {
            return {
                "color-choice": true,
                [themeName]: true,
            };
        },

        changeTheme(themeName) {
            // Immediately update theme classes
            this.themeClass = this.colorThemes.reduce(
                (acc, theme) => ({
                    ...acc,
                    [theme]: theme === themeName,
                }),
                {},
            );

            // Save theme selection
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, themeName);
            this.currentTheme = themeName;
        },
    }));

    // Register the main app component
    Alpine.data("appState", () => ({
        person: profileManager.profile,
        username: "",
        password: "",
        loginError: "",
        loading: false,
        friends: [],
        newFriend: "",

        init() {
            this.checkStoredSession();
        },

        async checkStoredSession() {
            const stored = StorageManager.getStoredAuthData();
            if (stored) {
                authManager.setTokens(stored.accessJwt, stored.refreshJwt);
                this.person = stored.profile;
            }
        },

        async loginUser() {
            this.loading = true;
            this.loginError = "";

            try {
                const authData = await authManager.authenticate(
                    this.username,
                    this.password,
                );
                const profile = await profileManager.fetchProfile(
                    authData.handle,
                );

                this.person = profile;
                StorageManager.saveAuthData(authData, profile);

                this.password = "";
            } catch (error) {
                console.error("Login error:", error);
                this.loginError =
                    "Login failed. Please check your credentials.";
            } finally {
                this.loading = false;
            }
        },

        logout() {
            authManager.clearTokens();
            StorageManager.clearAuthData();
            this.person = {};
            this.username = "";
            this.password = "";
            this.loginError = "";
        },

        addFriend() {
            if (this.newFriend && !this.friends.includes(this.newFriend)) {
                this.friends.push(this.newFriend);
                this.newFriend = "";
            }
        },
    }));
});
