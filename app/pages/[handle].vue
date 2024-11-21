<!-- pages/[handle].vue -->
<template>
    <div class="min-h-screen bg-[#EDEEF3] py-8">
        <div class="max-w-4xl mx-auto px-4">
            <!-- Classic MySpace table layout -->
            <table class="w-full bg-white border border-gray-300">
                <tbody>
                    <tr>
                        <td class="w-80 p-4 align-top">
                            <!-- Left Column -->
                            <div class="space-y-4">
                                <!-- Profile Section -->
                                <table class="w-full border border-gray-300">
                                    <tbody>
                                        <tr>
                                            <td
                                                class="bg-[#003399] text-white font-bold p-2"
                                            >
                                                {{
                                                    profile.displayName ||
                                                    profile.handle
                                                }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="p-4">
                                                <div class="space-y-4">
                                                    <img
                                                        :src="
                                                            profile.avatar ||
                                                            '/default-avatar.png'
                                                        "
                                                        :alt="
                                                            profile.displayName
                                                        "
                                                        class="w-full aspect-square object-cover border border-gray-300"
                                                    />

                                                    <div class="text-sm">
                                                        <p>
                                                            "{{
                                                                profile.bio ||
                                                                "No bio yet"
                                                            }}"
                                                        </p>
                                                        <p class="mt-2">
                                                            Last Login:
                                                            <span
                                                                class="text-[#003399]"
                                                            >
                                                                {{
                                                                    formatDate(
                                                                        profile.lastLoginDate,
                                                                    )
                                                                }}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <!-- Contact Section -->
                                <table class="w-full border border-gray-300">
                                    <tbody>
                                        <tr>
                                            <td
                                                class="bg-[#003399] text-white font-bold p-2"
                                            >
                                                Contact
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="p-4">
                                                <div class="space-y-2">
                                                    <template
                                                        v-if="
                                                            profile.musicServices
                                                        "
                                                    >
                                                        <a
                                                            v-if="
                                                                profile
                                                                    .musicServices
                                                                    .spotify
                                                            "
                                                            :href="
                                                                profile
                                                                    .musicServices
                                                                    .spotify
                                                            "
                                                            target="_blank"
                                                            class="block px-4 py-2 bg-[#003399] text-white text-center hover:bg-[#002266]"
                                                        >
                                                            Spotify
                                                        </a>
                                                        <a
                                                            v-if="
                                                                profile
                                                                    .musicServices
                                                                    .appleMusic
                                                            "
                                                            :href="
                                                                profile
                                                                    .musicServices
                                                                    .appleMusic
                                                            "
                                                            target="_blank"
                                                            class="block px-4 py-2 bg-[#003399] text-white text-center hover:bg-[#002266]"
                                                        >
                                                            Apple Music
                                                        </a>
                                                    </template>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </td>

                        <td class="p-4 align-top">
                            <!-- Right Column -->
                            <div class="space-y-4">
                                <!-- About Me Section -->
                                <table class="w-full border border-gray-300">
                                    <tbody>
                                        <tr>
                                            <td
                                                class="bg-[#003399] text-white font-bold p-2"
                                            >
                                                About Me
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="p-4">
                                                {{
                                                    profile.bio || "No bio yet"
                                                }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <!-- Top 8 Section -->
                                <table class="w-full border border-gray-300">
                                    <tbody>
                                        <tr>
                                            <td
                                                class="bg-[#003399] text-white font-bold p-2"
                                            >
                                                {{ profile.displayName }}'s Top
                                                8
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="p-4">
                                                <div
                                                    class="grid grid-cols-4 gap-4"
                                                >
                                                    <div
                                                        v-for="(
                                                            friend, index
                                                        ) in profile.top8"
                                                        :key="index"
                                                        class="text-center"
                                                    >
                                                        <img
                                                            :src="
                                                                friend.avatar ||
                                                                '/default-avatar.png'
                                                            "
                                                            :alt="
                                                                friend.displayName
                                                            "
                                                            class="w-full aspect-square object-cover border border-gray-300"
                                                        />
                                                        <p
                                                            class="mt-1 text-sm text-[#003399]"
                                                        >
                                                            {{
                                                                friend.displayName
                                                            }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <!-- Blog Posts Section -->
                                <table class="w-full border border-gray-300">
                                    <tbody>
                                        <tr>
                                            <td
                                                class="bg-[#003399] text-white font-bold p-2"
                                            >
                                                {{ profile.displayName }}'s
                                                Posts
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="p-4">
                                                <div class="space-y-4">
                                                    <div
                                                        v-for="post in profile.posts"
                                                        :key="post.postId"
                                                        class="border-b border-gray-300 pb-4"
                                                    >
                                                        <div
                                                            class="font-bold text-sm text-[#003399]"
                                                        >
                                                            {{
                                                                formatDate(
                                                                    post.date,
                                                                )
                                                            }}
                                                        </div>
                                                        <div class="mt-2">
                                                            {{ post.content }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const profile = useProfileStore();
const auth = useAuthStore();

const handle = computed(() => route.params.handle as string);

// Load profile data
onMounted(async () => {
    await profile.fetchProfile(handle.value);
});

// Format date helper
const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};
</script>
