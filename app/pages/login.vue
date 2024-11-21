<!-- pages/login.vue -->
<template>
    <div class="min-h-screen bg-[#EDEEF3] flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <!-- Classic MySpace-style table layout -->
            <table class="w-full bg-white border border-[#003399]">
                <tbody>
                    <tr>
                        <td class="bg-[#003399] text-white font-bold p-2">
                            Member Login
                        </td>
                    </tr>
                    <tr>
                        <td class="p-4">
                            <form
                                @submit.prevent="handleLogin"
                                class="space-y-4"
                            >
                                <div>
                                    <label class="block text-sm font-bold mb-2">
                                        Bluesky Handle or Email:
                                    </label>
                                    <input
                                        v-model="identifier"
                                        type="text"
                                        class="w-full p-2 border border-[#003399]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-bold mb-2">
                                        App Password:
                                    </label>
                                    <input
                                        v-model="password"
                                        type="password"
                                        class="w-full p-2 border border-[#003399]"
                                        required
                                    />
                                </div>

                                <div
                                    v-if="error"
                                    class="text-red-600 text-sm p-2 bg-red-50"
                                >
                                    {{ error }}
                                </div>

                                <div class="flex items-center justify-between">
                                    <button
                                        type="submit"
                                        class="bg-[#003399] text-white px-4 py-2 hover:bg-[#002266]"
                                        :disabled="isLoading"
                                    >
                                        {{
                                            isLoading
                                                ? "Logging in..."
                                                : "Login"
                                        }}
                                    </button>
                                </div>

                                <div class="mt-4 text-sm">
                                    <p class="text-gray-600">
                                        Note: Please use your Bluesky App
                                        Password instead of your main account
                                        password.
                                        <a
                                            href="https://bsky.app/settings"
                                            target="_blank"
                                            class="text-[#003399] underline"
                                        >
                                            Create an App Password
                                        </a>
                                    </p>
                                </div>
                            </form>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Logo and Branding -->
            <div class="text-center mt-8">
                <h1 class="text-2xl font-bold text-[#003399]">Top8.space</h1>
                <p class="text-gray-600 mt-2">
                    Your MySpace-style Top 8 for Bluesky
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const router = useRouter();
const auth = useAuthStore();

const identifier = ref("");
const password = ref("");
const error = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
    isLoading.value = true;
    error.value = "";

    try {
        const result = await auth.login(identifier.value, password.value);
        if (result.success) {
            router.push("/");
        } else {
            error.value =
                result.error || "Login failed. Please check your credentials.";
        }
    } catch (e) {
        error.value = "An unexpected error occurred. Please try again.";
    } finally {
        isLoading.value = false;
    }
};

// Redirect if already logged in
onMounted(() => {
    if (auth.isLoggedIn) {
        router.push("/");
    }
});
</script>
