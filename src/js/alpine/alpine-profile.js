// src/js/alpine/alpine-profile.js
document.addEventListener("alpine:init", () => {
    Alpine.data("profileView", () => ({
        viewedProfile: null,
        loading: false,
        error: null,
        isOwnProfile: false,

        async init() {
            const router = this.$router;
            const handle = router.params.handle;

            // If no handle is provided, show own profile
            if (!handle) {
                this.isOwnProfile = true;
                this.viewedProfile = this.$store.person;
                return;
            }

            // Load profile for provided handle
            await this.loadProfile(handle);

            // Watch for route parameter changes
            this.$watch('$router.params', async (params) => {
                if (params.handle) {
                    await this.loadProfile(params.handle);
                }
            });
        },

        async loadProfile(handle) {
            this.loading = true;
            this.error = null;

            try {
                const currentUser = this.$store.person;
                
                // Check if this is the current user's profile
                if (currentUser?.bsky_handle === handle) {
                    this.isOwnProfile = true;
                    this.viewedProfile = currentUser;
                    return;
                }

                // Load profile from Bluesky
                this.viewedProfile = await window.managers.profileManager.fetchProfile(handle);
                this.isOwnProfile = false;

            } catch (error) {
                console.error("[ProfileView] Error loading profile:", error);
                this.error = `Failed to load profile: ${error.message}`;
                this.viewedProfile = null;
            } finally {
                this.loading = false;
            }
        }
    }));
});
