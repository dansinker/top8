<!-- components/profile/MusicLinks.vue -->
<template>
    <div class="space-y-2">
        <a
            v-if="services.spotify"
            :href="services.spotify"
            target="_blank"
            class="music-link spotify"
        >
            <span class="icon">🎵</span>
            Spotify
        </a>

        <a
            v-if="services.appleMusic"
            :href="services.appleMusic"
            target="_blank"
            class="music-link apple"
        >
            <span class="icon">🎵</span>
            Apple Music
        </a>

        <a
            v-if="services.amazonMusic"
            :href="services.amazonMusic"
            target="_blank"
            class="music-link amazon"
        >
            <span class="icon">🎵</span>
            Amazon Music
        </a>

        <div
            v-if="!hasAnyService"
            class="text-sm text-gray-500 text-center py-2"
        >
            No music profiles added
        </div>
    </div>
</template>

<script setup lang="ts">
interface MusicServices {
    spotify?: string;
    appleMusic?: string;
    amazonMusic?: string;
}

const props = defineProps<{
    services: MusicServices;
}>();

const hasAnyService = computed(() => {
    return Object.values(props.services).some(Boolean);
});
</script>

<style scoped>
.music-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: #003399;
    color: white;
    text-decoration: none;
    transition: background-color 0.2s;
}

.music-link:hover {
    background-color: #002266;
}

.icon {
    font-size: 1.25rem;
}

.spotify {
    background-color: #1db954;
}

.spotify:hover {
    background-color: #1aa34a;
}

.apple {
    background-color: #fb2d3f;
}

.apple:hover {
    background-color: #e02537;
}

.amazon {
    background-color: #00a8e1;
}

.amazon:hover {
    background-color: #0096c9;
}
</style>
