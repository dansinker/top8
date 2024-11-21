<!-- app.vue -->
<template>
    <div>
        <!-- Navigation Bar -->
        <nav class="bg-[#003399] text-white">
            <div class="max-w-4xl mx-auto px-4">
                <div class="flex justify-between items-center h-14">
                    <NuxtLink to="/" class="font-bold"> Top8.space </NuxtLink>

                    <div class="flex items-center gap-4">
                        <template v-if="auth.isLoggedIn">
                            <NuxtLink
                                :to="`/${auth.session?.handle}`"
                                class="hover:text-gray-200"
                            >
                                My Profile
                            </NuxtLink>
                            <NuxtLink to="/edit" class="hover:text-gray-200">
                                Edit Profile
                            </NuxtLink>
                            <button
                                @click="handleLogout"
                                class="hover:text-gray-200"
                            >
                                Logout
                            </button>
                        </template>
                        <template v-else>
                            <NuxtLink to="/login" class="hover:text-gray-200">
                                Login
                            </NuxtLink>
                        </template>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <NuxtPage />

        <!-- Footer -->
        <footer class="bg-white border-t mt-8 py-6">
            <div class="max-w-4xl mx-auto px-4 text-center text-gray-600">
                <p>© 2024 Top8.space - A MySpace-style Top 8 for Bluesky</p>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
const auth = useAuth();
const router = useRouter();

const handleLogout = async () => {
    await auth.logout();
    router.push("/");
};

// Initialize auth state from storage
onMounted(async () => {
    await auth.initializeFromStorage();
});
</script>

<style>
/* Classic MySpace-inspired styles */
body {
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

a {
    text-decoration: none;
}

table {
    border-collapse: collapse;
}
</style>
