<!-- pages/edit.vue -->
<template>
    <div class="min-h-screen bg-[#EDEEF3] py-8">
        <div class="max-w-4xl mx-auto px-4">
            <table class="w-full bg-white border border-gray-300">
                <tr>
                    <td class="bg-[#003399] text-white font-bold p-2">
                        Edit Profile
                    </td>
                </tr>
                <tr>
                    <td class="p-4">
                        <form @submit.prevent="saveProfile" class="space-y-6">
                            <!-- Theme Selection -->
                            <div class="space-y-2">
                                <h3 class="font-bold">Theme Color</h3>
                                <div class="grid grid-cols-6 gap-2">
                                    <button
                                        v-for="color in themeColors"
                                        :key="color.hex"
                                        type="button"
                                        class="w-12 h-12 border-2 rounded"
                                        :class="{
                                            'border-black':
                                                selectedColor === color.hex,
                                        }"
                                        :style="{ backgroundColor: color.hex }"
                                        @click="selectedColor = color.hex"
                                    />
                                </div>
                            </div>

                            <!-- Music Services -->
                            <div class="space-y-2">
                                <h3 class="font-bold">Music Services</h3>
                                <div class="space-y-3">
                                    <div>
                                        <label class="block text-sm mb-1"
                                            >Spotify Profile URL</label
                                        >
                                        <input
                                            v-model="musicServices.spotify"
                                            type="url"
                                            class="w-full p-2 border border-gray-300"
                                            placeholder="https://open.spotify.com/user/..."
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-sm mb-1"
                                            >Apple Music Profile URL</label
                                        >
                                        <input
                                            v-model="musicServices.appleMusic"
                                            type="url"
                                            class="w-full p-2 border border-gray-300"
                                            placeholder="https://music.apple.com/profile/..."
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-sm mb-1"
                                            >Amazon Music Profile URL</label
                                        >
                                        <input
                                            v-model="musicServices.amazonMusic"
                                            type="url"
                                            class="w-full p-2 border border-gray-300"
                                            placeholder="https://music.amazon.com/user/..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Top 8 Friends -->
                            <div class="space-y-2">
                                <h3 class="font-bold">Top 8 Friends</h3>
                                <div class="space-y-4">
                                    <div
                                        v-for="(friend, index) in top8Friends"
                                        :key="index"
                                        class="flex gap-2"
                                    >
                                        <span class="w-6 text-center"
                                            >{{ index + 1 }}.</span
                                        >
                                        <input
                                            v-model="top8Friends[index]"
                                            type="text"
                                            class="flex-1 p-2 border border-gray-300"
                                            placeholder="Enter Bluesky handle..."
                                        />
                                        <button
                                            type="button"
                                            class="px-2 text-red-600"
                                            @click="removeFriend(index)"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        class="text-[#003399]"
                                        @click="addFriend"
                                        v-if="top8Friends.length < 8"
                                    >
                                        + Add Friend
                                    </button>
                                </div>
                            </div>

                            <!-- Error Message -->
                            <div
                                v-if="error"
                                class="text-red-600 bg-red-50 p-3"
                            >
                                {{ error }}
                            </div>

                            <!-- Save Button -->
                            <div class="flex justify-end gap-2">
                                <NuxtLink
                                    :to="`/${auth.session?.handle}`"
                                    class="px-4 py-2 border border-[#003399] text-[#003399]"
                                >
                                    Cancel
                                </NuxtLink>
                                <button
                                    type="submit"
                                    class="px-4 py-2 bg-[#003399] text-white"
                                    :disabled="isSaving"
                                >
                                    {{
                                        isSaving ? "Saving..." : "Save Changes"
                                    }}
                                </button>
                            </div>
                        </form>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
const profile = useProfileStore();
const auth = useAuthStore();
const router = useRouter();

// Theme colors based on spec
const themeColors = [
    { name: "Classic Blue", hex: "#0000FF" },
    { name: "Forest Green", hex: "#228B22" },
    { name: "Ruby Red", hex: "#E0115F" },
    { name: "Royal Purple", hex: "#7851A9" },
    { name: "Sunset Orange", hex: "#FD5E53" },
    { name: "Ocean Teal", hex: "#469990" },
    { name: "Lavender", hex: "#E6E6FA" },
    { name: "Rose Gold", hex: "#B76E79" },
    { name: "Midnight Blue", hex: "#191970" },
    { name: "Emerald", hex: "#50C878" },
    { name: "Burgundy", hex: "#800020" },
    { name: "Golden", hex: "#FFD700" },
];

// Form state
const selectedColor = ref(
    profile.currentTheme?.baseColor || themeColors[0].hex,
);
const musicServices = ref({ ...profile.currentMusicServices });
const top8Friends = ref(
    profile.currentTop8.length ? [...profile.currentTop8] : [""],
);
const error = ref("");
const isSaving = ref(false);

// Handle friend list
const addFriend = () => {
    if (top8Friends.value.length < 8) {
        top8Friends.value.push("");
    }
};

const removeFriend = (index: number) => {
    top8Friends.value.splice(index, 1);
};

// Save all changes
const saveProfile = async () => {
    isSaving.value = true;
    error.value = "";

    try {
        await Promise.all([
            profile.updateTheme(selectedColor.value),
            profile.updateMusicServices(musicServices.value),
            profile.updateTop8(top8Friends.value.filter((f) => f.trim())),
        ]);

        router.push(`/${auth.session?.handle}`);
    } catch (e) {
        error.value = "Failed to save changes. Please try again.";
    } finally {
        isSaving.value = false;
    }
};

// Load current profile data
onMounted(async () => {
    if (!auth.isLoggedIn) {
        router.push("/login");
        return;
    }

    await profile.fetchProfile();
});
</script>
