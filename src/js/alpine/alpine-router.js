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

        handleLocation() {
            const path = window.location.pathname;
            this.currentPath = path;

            // Parse parameters for profile routes
            if (path.startsWith("/profile/")) {
                const did = path.split("/profile/")[1];
                if (did) {
                    this.params = { did };
                }
            } else {
                this.params = {};
            }
        },

        navigate(path) {
            window.history.pushState({}, "", path);
            this.handleLocation();
        },

        isCurrentPath(path) {
            if (path === "/") {
                return this.currentPath === "/";
            }
            return this.currentPath.startsWith(path);
        },
    }));
});
