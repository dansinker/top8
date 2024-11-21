<!-- components/profile/PostList.vue -->
<template>
    <div class="space-y-6">
        <div v-for="post in posts" :key="post.postId" class="post-container">
            <!-- Post Header -->
            <div class="flex justify-between items-start mb-2">
                <div class="font-bold text-sm text-[#003399]">
                    {{ formatDate(post.date) }}
                </div>
                <div class="flex gap-2">
                    <button
                        v-if="post.canShare"
                        @click="handleShare(post.postId)"
                        class="text-xs text-[#003399] hover:underline"
                    >
                        Share to Bulletin
                    </button>
                </div>
            </div>

            <!-- Post Content -->
            <div class="text-sm">
                {{ post.content }}
            </div>

            <!-- Post Metadata -->
            <div class="mt-2 text-xs text-gray-500">
                {{ formatTime(post.date) }}
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-4">Loading posts...</div>

        <!-- Empty State -->
        <div
            v-if="!loading && posts.length === 0"
            class="text-center py-4 text-gray-500"
        >
            No posts yet
        </div>
    </div>
</template>

<script setup lang="ts">
import { BskyAgent } from "@atproto/api";

interface Post {
    postId: string;
    content: string;
    date: string;
    canShare: boolean;
}

const props = defineProps<{
    posts: Post[];
    loading?: boolean;
}>();

const auth = useAuthStore();

// Format utilities
const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
};

// Handle sharing post to Bluesky
const handleShare = async (postId: string) => {
    if (!auth.agent) return;

    try {
        await auth.agent.repost(postId);
    } catch (error) {
        console.error("Failed to share post:", error);
    }
};

defineExpose({
    formatDate,
    formatTime,
});
</script>

<style scoped>
.post-container {
    position: relative;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.post-container:last-child {
    border-bottom: none;
}
</style>
