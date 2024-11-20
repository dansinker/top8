// Wait for Alpine to be available
document.addEventListener("alpine:init", () => {
    // Create instances of our managers
    const authManager = new AuthManager();
    const profileManager = new ProfileManager(authManager);
    const themeManager = new PDSThemeManager();
    const storageManager = new StorageManager();
    const postsManager = new PostManager();

    // Initialize the store
    Alpine.store("person", {});

    Alpine.store("state", {
        person: {},
        posts: [],
        setPerson(person) {
            this.person = person;
        },
    });

    // Register the theme component
    Alpine.data("theme", () => ({
        colorThemes: [],
        themeClass: {},
        currentTheme: null,
        defaultTheme: "light",

        init() {
            this.colorThemes = themeManager.colorThemes;
            const storedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);

            if (storedTheme && this.validateTheme(storedTheme)) {
                this.changeTheme(storedTheme);
            } else {
                this.changeTheme(this.defaultTheme);
            }
        },

        validateTheme(themeName) {
            return this.colorThemes.includes(themeName);
        },

        choiceClass(themeName) {
            if (!this.validateTheme(themeName)) {
                return { "color-choice": true };
            }
            return {
                "color-choice": true,
                [themeName]: true,
            };
        },

        changeTheme(themeName) {
            if (!this.validateTheme(themeName)) return;

            // Update Alpine state
            this.themeClass = this.colorThemes.reduce(
                (acc, theme) => ({
                    ...acc,
                    [theme]: theme === themeName,
                }),
                {},
            );

            // Update DOM directly
            document.body.className = "";
            document.body.classList.add(themeName);

            // Store theme
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

        async logout() {
            console.debug("[Logout] Starting logout process");
            try {
                // Clear auth tokens
                console.debug("[Logout] Clearing auth tokens");
                await authManager.clearTokens();

                // Clear stored data
                console.debug("[Logout] Clearing stored auth data");
                await StorageManager.clearAuthData();

                // Reset local state
                console.debug("[Logout] Resetting local state");
                this.person = {};
                this.username = "";
                this.password = "";
                this.loginError = "";

                // Reset Alpine stores
                console.debug("[Logout] Resetting Alpine stores");
                Alpine.store("person", {});
                Alpine.store("state").setPerson({});

                console.debug("[Logout] Logout completed successfully");
            } catch (error) {
                console.error("[Logout] Error during logout:", error);
                // Still attempt to clear sensitive data even if error occurs
                this.person = {};
                this.username = "";
                this.password = "";
                throw new Error("Logout failed: " + error.message);
            }
        },

        async checkStoredSession() {
            console.debug("[Session] Checking for stored session data");
            try {
                const stored = StorageManager.getStoredAuthData();

                if (!stored) {
                    console.debug("[Session] No stored session found");
                    return;
                }

                console.debug("[Session] Found stored session data:", {
                    hasAccessToken: !!stored.accessJwt,
                    hasRefreshToken: !!stored.refreshJwt,
                    hasProfile: !!stored.profile,
                });

                if (!stored.accessJwt || !stored.refreshJwt) {
                    console.warn(
                        "[Session] Incomplete token data in stored session",
                    );
                    StorageManager.clearAuthData();
                    return;
                }

                if (!stored.profile) {
                    console.warn(
                        "[Session] Missing profile data in stored session",
                    );
                    StorageManager.clearAuthData();
                    return;
                }

                console.debug("[Session] Setting tokens and profile");
                try {
                    authManager.setTokens(stored.accessJwt, stored.refreshJwt);
                    this.person = stored.profile;
                    Alpine.store("person", stored.profile);
                    Alpine.store("state").setPerson(stored.profile);
                    console.debug("[Session] Successfully restored session");
                } catch (error) {
                    console.error(
                        "[Session] Error setting session data:",
                        error,
                    );
                    StorageManager.clearAuthData();
                }
            } catch (error) {
                console.error(
                    "[Session] Critical error checking stored session:",
                    error,
                );
                StorageManager.clearAuthData();
            }
        },

        async loginUser() {
            console.debug("[Login] Starting login process");

            // Validate inputs before attempting login
            if (!this.username || !this.password) {
                console.warn("[Login] Missing credentials");
                this.loginError = "Please provide both username and password";
                return;
            }

            this.loading = true;
            this.loginError = "";

            try {
                console.debug("[Login] Attempting authentication");
                const authData = await authManager.authenticate(
                    this.username.trim(),
                    this.password,
                );

                if (!authData || !authData.handle) {
                    console.error("[Login] Invalid auth data received");
                    throw new Error("Invalid authentication response");
                }

                console.debug(
                    "[Login] Authentication successful, fetching profile",
                );
                const profile = await profileManager.fetchProfile(
                    authData.handle,
                );

                if (!profile) {
                    console.error("[Login] No profile data received");
                    throw new Error("Failed to fetch user profile");
                }

                console.debug("[Login] Profile fetched successfully:", {
                    handle: profile.handle,
                    hasData: !!profile,
                });

                // Update all relevant stores/states
                this.person = profile;
                Alpine.store("person", profile);
                Alpine.store("state").setPerson(profile);

                console.debug("[Login] Saving auth data");
                StorageManager.saveAuthData(authData, profile);

                // Clear sensitive data
                this.password = "";
                this.username = "";

                console.debug("[Login] Login process completed successfully");
            } catch (error) {
                console.error("[Login] Error during login process:", error);

                // Provide more specific error messages
                if (error.status === 401 || error.status === 403) {
                    this.loginError =
                        "Invalid credentials. Please check your username and password.";
                } else if (error.message.includes("network")) {
                    this.loginError =
                        "Network error. Please check your connection and try again.";
                } else {
                    this.loginError =
                        "Login failed: " +
                        (error.message || "Unknown error occurred");
                }

                // Clear sensitive data on error
                this.password = "";
            } finally {
                this.loading = false;
                console.debug(
                    "[Login] Login process finished, loading state cleared",
                );
            }
        },
    }));

    // Register the posts component
    Alpine.data("posts", () => ({
        blogs: [],
        loading: true,
        error: null,
        lastHandle: null, // Track last processed handle to prevent duplicate loads

        init() {
            console.debug("[Posts Component] Initializing posts component");
            this.loadInitialPosts();
            this.setupWatcher();
        },

        async loadInitialPosts() {
            // Check for person data on init
            console.debug("[Posts Component] Checking for initial person data");
            const person = Alpine.store("state").person;
            if (person?.bsky_handle) {
                console.debug(
                    "[Posts Component] Found initial person data, loading posts",
                );
                await this.loadPostsForHandle(person.bsky_handle);
            }
        },

        setupWatcher() {
            console.debug("[Posts Component] Setting up person store watcher");
            this.$watch("$store.person", async (person) => {
                if (!person) {
                    console.debug(
                        "[Posts Component] Person data cleared, resetting state",
                    );
                    this.resetState();
                    return;
                }

                if (!person.bsky_handle) {
                    console.warn(
                        "[Posts Component] Person missing bsky_handle",
                    );
                    this.error =
                        "Invalid user profile - missing Bluesky handle";
                    return;
                }

                if (person.bsky_handle === this.lastHandle) {
                    console.debug(
                        "[Posts Component] Skipping duplicate load for handle:",
                        person.bsky_handle,
                    );
                    return;
                }

                await this.loadPostsForHandle(person.bsky_handle);
            });
        },

        async loadPostsForHandle(handle) {
            console.debug(
                "[Posts Component] Loading posts for handle:",
                handle,
            );
            this.loading = true;
            this.error = null;

            try {
                const postManager = new PostManager();
                const state = await postManager.loadPosts(handle);

                console.debug("[Posts Component] Posts loaded:", {
                    postCount: state.blogs?.length || 0,
                    loading: state.loading,
                    error: state.error,
                });

                this.blogs = state.blogs || [];
                this.loading = state.loading;
                this.error = state.error;
                this.lastHandle = handle;
            } catch (error) {
                console.error("[Posts Component] Error loading posts:", error);
                this.error = "Failed to load posts: " + error.message;
                this.blogs = [];
            } finally {
                this.loading = false;
            }
        },

        resetState() {
            this.blogs = [];
            this.loading = false;
            this.error = null;
            this.lastHandle = null;
        },
    }));
});
