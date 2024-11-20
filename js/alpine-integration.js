// Wait for Alpine to be available
document.addEventListener("alpine:init", () => {
    // Create instances of our managers
    const authManager = new AuthManager();
    const profileManager = new ProfileManager(authManager);
    const themeManager = new ThemeManager();
    const storageManager = new StorageManager();
    const postsManager = new PostManager();

    // Initialize the store
    Alpine.store("person", {});

    // Register the theme component
    Alpine.data("theme", () => ({
        colorThemes: [],
        themeClass: {},
        currentTheme: null,

        init() {
            this.colorThemes = themeManager.colorThemes;
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
            this.themeClass = this.colorThemes.reduce(
                (acc, theme) => ({
                    ...acc,
                    [theme]: theme === themeName,
                }),
                {},
            );
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, themeName);
            this.currentTheme = themeName;
        },
    }));

    // Register the main app component
    Alpine.data("appState", () => ({
        person: {},
        username: "",
        password: "",
        loginError: "",
        loading: false,
        friends: [],
        newFriend: "",

        init() {
            this.checkStoredSession();
        },

        logout() {
            authManager.clearTokens();
            StorageManager.clearAuthData();
            this.person = {};
            this.username = "";
            this.password = "";
            this.loginError = "";
        },

        async checkStoredSession() {
            const stored = StorageManager.getStoredAuthData();
            if (stored) {
                authManager.setTokens(stored.accessJwt, stored.refreshJwt);
                this.person = stored.profile;
                Alpine.store("person", stored.profile);
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
                Alpine.store("person", profile);
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

        addFriend() {
            if (this.newFriend && !this.friends.includes(this.newFriend)) {
                this.friends.push(this.newFriend);
                this.newFriend = "";
            }
        },
    }));

    // Register the posts component
    Alpine.data("posts", () => ({
        blogs: [],
        loading: true,
        error: null,

        init() {
            this.$watch("$store.person", async (person) => {
                if (person?.bsky_handle) {
                    const postManager = new PostManager();
                    const state = await postManager.loadPosts(
                        person.bsky_handle,
                    );
                    this.blogs = state.blogs;
                    this.loading = state.loading;
                    this.error = state.error;
                }
            });
        },
    }));
});
