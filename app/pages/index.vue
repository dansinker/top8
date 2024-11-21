<!-- pages/index.vue -->
<template>
    <div class="min-h-screen bg-[#EDEEF3]">
        <div v-if="!auth.isLoggedIn" class="max-w-4xl mx-auto px-4 py-16">
            <!-- Welcome Page -->
            <div class="text-center space-y-6">
                <h1 class="text-4xl font-bold text-[#003399]">
                    Welcome to Top8.space
                </h1>
                <p class="text-xl text-gray-600">
                    Your MySpace-style Top 8 for Bluesky
                </p>
                <div class="space-x-4">
                    <NuxtLink
                        to="/login"
                        class="inline-block px-6 py-3 bg-[#003399] text-white font-bold"
                    >
                        Login with Bluesky
                    </NuxtLink>
                </div>

                <!-- Feature Preview -->
                <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-white p-6 border border-gray-300">
                        <h3 class="font-bold text-lg mb-2">Classic Style</h3>
                        <p class="text-gray-600">
                            Experience the nostalgic design of 2006-era social
                            networking
                        </p>
                    </div>
                    <div class="bg-white p-6 border border-gray-300">
                        <h3 class="font-bold text-lg mb-2">Top 8 Friends</h3>
                        <p class="text-gray-600">
                            Choose and display your closest Bluesky connections
                        </p>
                    </div>
                    <div class="bg-white p-6 border border-gray-300">
                        <h3 class="font-bold text-lg mb-2">
                            Music Integration
                        </h3>
                        <p class="text-gray-600">
                            Share your Spotify, Apple Music, and Amazon Music
                            profiles
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div v-else>
            <!-- Redirect to user profile when logged in -->
            <ClientOnly>
                <div
                    v-if="isLoading"
                    class="flex justify-center items-center min-h-screen"
                >
                    <div class="text-[#003399]">Loading...</div>
                </div>
            </ClientOnly>
        </div>
    </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const router = useRouter();
const isLoading = ref(true);

onMounted(async () => {
    if (auth.isLoggedIn) {
        await auth.initializeFromStorage();
        if (auth.session?.handle) {
            router.push(`/${auth.session.handle}`);
        }
    }
    isLoading.value = false;
});
</script>
