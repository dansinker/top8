// src/js/alpine/alpine-router.js
document.addEventListener("alpine:init", () => {
    Alpine.data("router", () => ({
        currentPath: "/",
        params: {},

        init() {
            // Set initial path
            this.handleLocation();

            // Listen for popstate events (browser back/forward)
            window.addEventListener("popstate", () => this.handleLocation());

            // Intercept link clicks for SPA navigation
            document.addEventListener("click", (e) => {
                const link = e.target.closest("a");
                if (link && link.href.startsWith(window.location.origin)) {
                    e.preventDefault();
                    this.navigate(new URL(link.href).pathname);
                }
            });
        },

        // Match dynamic profile paths: /profile/[handle]
        matchProfilePath(path) {
            const profileRegex = /^\/profile\/([^/]+)$/;
            const match = path.match(profileRegex);
            if (match) {
                return {
                    handle: decodeURIComponent(match[1]),
                };
            }
            return null;
        },

        handleLocation() {
            const path = window.location.pathname;
            this.currentPath = path;
            this.params = {}; // Reset params

            // Check for profile path match
            const profileMatch = this.matchProfilePath(path);
            if (profileMatch) {
                this.params = { handle: profileMatch.handle };
                console.debug("[Router] Profile route matched:", this.params);
            }
        },

        navigate(path) {
            window.history.pushState({}, "", path);
            this.handleLocation();
        },

        isCurrentPath(pattern) {
            if (pattern === "/") {
                return this.currentPath === "/";
            }

            // Special handling for profile routes
            if (pattern === "/profile") {
                return (
                    this.currentPath.startsWith("/profile/") ||
                    this.currentPath === "/profile"
                );
            }

            return this.currentPath.startsWith(pattern);
        },
    }));
});
