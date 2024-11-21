document.addEventListener("alpine:init", () => {
    // Create instances of our managers
    const authManager = new AuthManager();
    const profileManager = new ProfileManager(authManager);
    const themeManager = new PDSThemeManager(authManager);
    const postsManager = new PostManager();
    const top8Manager = new Top8Manager(authManager);

    // Initialize the store
    Alpine.store("person", {});

    Alpine.store("state", {
        person: {},
        posts: [],
        top8Friends: [],
        setPerson(person) {
            this.person = person;
        },
        setTop8Friends(friends) {
            this.top8Friends = friends;
        },
    });

    // Register the theme component
    Alpine.data("theme", () => ({
        colorThemes: [],
        themeClass: {},
        currentTheme: null,

        async init() {
            this.colorThemes = themeManager.colorThemes;
            // Set a default theme immediately
            this.themeClass = themeManager.getThemeClasses();
            document.body.className = themeManager.colorThemes[0];

            // If we have a logged-in user, initialize their theme
            const storedPerson = Alpine.store("person");
            if (storedPerson?.bsky_handle) {
                try {
                    await themeManager.initialize();
                    this.themeClass = themeManager.getThemeClasses();
                } catch (error) {
                    console.error("Failed to initialize theme:", error);
                }
            }
        },

        validateTheme(themeName) {
            return themeManager.validateTheme(themeName);
        },

        choiceClass(themeName) {
            return themeManager.choiceClass(themeName);
        },

        async changeTheme(themeName) {
            try {
                const result = await themeManager.setTheme(themeName);
                this.themeClass = result;
            } catch (error) {
                console.error("Failed to change theme:", error);
            }
        },
    }));

    // Register the Top8 component
    Alpine.data("top8", () => ({
        friends: [],
        searchQuery: "",
        searchResults: [],
        selectedFriends: [],
        showDialog: false,
        loading: false,
        error: null,

        async init() {
            if (this.$store.person?.bsky_handle) {
                await this.loadFriends();
            }

            // Watch for person changes to reload friends
            this.$watch("$store.person", async (person) => {
                if (person?.bsky_handle) {
                    await this.loadFriends();
                } else {
                    this.friends = [];
                }
            });
        },

        async loadFriends() {
            try {
                this.loading = true;
                this.error = null;
                const friends = await top8Manager.initialize();
                this.friends = friends;
                this.selectedFriends = [...friends]; // Copy current friends to selected
                Alpine.store("state").setTop8Friends(friends);
            } catch (error) {
                console.error("Failed to load friends:", error);
                this.error = "Failed to load friends: " + error.message;
            } finally {
                this.loading = false;
            }
        },

        async searchFriends() {
            if (!this.searchQuery.trim()) {
                this.searchResults = [];
                return;
            }

            try {
                this.loading = true;
                this.error = null;
                this.searchResults = await top8Manager.searchFollows(
                    this.searchQuery,
                );
            } catch (error) {
                console.error("Search failed:", error);
                this.error = "Search failed: " + error.message;
            } finally {
                this.loading = false;
            }
        },

        toggleFriend(friend) {
            const index = this.selectedFriends.findIndex(
                (f) => f.did === friend.did,
            );
            if (index === -1) {
                if (this.selectedFriends.length >= 8) {
                    this.error = "Maximum 8 friends allowed";
                    return;
                }
                this.selectedFriends.push(friend);
            } else {
                this.selectedFriends.splice(index, 1);
            }
        },

        isFriendSelected(friend) {
            return this.selectedFriends.some((f) => f.did === friend.did);
        },

        async saveFriends() {
            try {
                this.loading = true;
                this.error = null;
                await top8Manager.saveFriends(this.selectedFriends);
                this.friends = [...this.selectedFriends];
                Alpine.store("state").setTop8Friends(this.friends);
                this.showDialog = false;
            } catch (error) {
                console.error("Failed to save friends:", error);
                this.error = "Failed to save friends: " + error.message;
            } finally {
                this.loading = false;
            }
        },
    }));

    // Register the main app component with theme support
    Alpine.data("appState", () => ({
        person: {},
        username: "",
        password: "",
        loginError: "",
        loading: false,

        async init() {
            await this.checkStoredSession();
        },

        async checkStoredSession() {
            console.debug("[Session] Checking for stored session data");
            try {
                const stored = StorageManager.getStoredAuthData();

                if (stored?.profile) {
                    authManager.setTokens(stored.accessJwt, stored.refreshJwt);
                    this.person = stored.profile;
                    Alpine.store("person", stored.profile);
                    Alpine.store("state").setPerson(stored.profile);

                    // Initialize theme and update Alpine state
                    await themeManager.initialize();
                    const themeComponent = this.$store.theme;
                    if (themeComponent) {
                        themeComponent.themeClass =
                            themeManager.getThemeClasses();
                    }
                }
            } catch (error) {
                console.error(
                    "[Session] Error checking stored session:",
                    error,
                );
                StorageManager.clearAuthData();
            }
        },

        async loginUser() {
            if (!this.username || !this.password) {
                this.loginError = "Please provide both username and password";
                return;
            }

            this.loading = true;
            this.loginError = "";

            try {
                const authData = await authManager.authenticate(
                    this.username.trim(),
                    this.password,
                );

                const profile = await profileManager.fetchProfile(
                    authData.handle,
                );

                // Update all relevant stores/states
                this.person = profile;
                Alpine.store("person", profile);
                Alpine.store("state").setPerson(profile);

                // Initialize theme immediately after login and update Alpine state
                await themeManager.initialize();

                // Update the theme component's state
                const themeComponent = this.$store.theme;
                if (themeComponent) {
                    themeComponent.themeClass = themeManager.getThemeClasses();
                }

                StorageManager.saveAuthData(authData, profile);

                // Clear sensitive data
                this.password = "";
                this.username = "";
            } catch (error) {
                console.error("[Login] Error during login process:", error);
                this.loginError = error.message || "Login failed";
                this.password = "";
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                await authManager.clearTokens();
                await StorageManager.clearAuthData();

                this.person = {};
                this.username = "";
                this.password = "";
                this.loginError = "";

                Alpine.store("person", {});
                Alpine.store("state").setPerson({});

                // Reset theme to default and update Alpine state
                const defaultTheme = themeManager.colorThemes[0];
                document.body.className = defaultTheme;
                themeManager.currentTheme = defaultTheme;
                const themeComponent = this.$store.theme;
                if (themeComponent) {
                    themeComponent.themeClass = themeManager.getThemeClasses();
                }
            } catch (error) {
                console.error("[Logout] Error during logout:", error);
                throw new Error("Logout failed: " + error.message);
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

    // Register the theme store
    Alpine.store("theme", {
        themeClass: themeManager.getThemeClasses(),
    });
});
