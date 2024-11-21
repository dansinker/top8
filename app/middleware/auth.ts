// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
    const auth = useAuth();

    // Routes that don't require authentication
    const publicRoutes = ["/", "/login"];

    // Check if route requires authentication
    if (!publicRoutes.includes(to.path) && !auth.isLoggedIn) {
        return navigateTo("/login");
    }

    // Redirect logged-in users from login page to their profile
    if (to.path === "/login" && auth.isLoggedIn) {
        return navigateTo(`/${auth.session?.handle}`);
    }
});
