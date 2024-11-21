<!-- components/profile/Top8Grid.vue -->
<template>
    <div class="grid grid-cols-4 gap-4">
        <div
            v-for="(friend, index) in friends"
            :key="friend.did"
            class="text-center"
        >
            <div class="relative">
                <img
                    :src="friend.avatar || '/default-avatar.png'"
                    :alt="friend.displayName"
                    class="w-full aspect-square object-cover border border-gray-300"
                />
                <div
                    class="absolute top-0 left-0 w-6 h-6 bg-[#003399] text-white flex items-center justify-center text-sm"
                >
                    {{ index + 1 }}
                </div>
            </div>
            <div class="mt-2 space-y-1">
                <p class="font-bold text-sm text-[#003399]">
                    {{ friend.displayName }}
                </p>
                <p class="text-xs text-gray-600">@{{ friend.handle }}</p>
                <NuxtLink
                    :to="`/${friend.handle}`"
                    class="text-xs text-[#003399] hover:underline"
                >
                    View Profile
                </NuxtLink>
            </div>
        </div>

        <!-- Empty slots -->
        <template v-if="friends.length < 8">
            <div
                v-for="i in 8 - friends.length"
                :key="`empty-${i}`"
                class="text-center"
            >
                <div class="relative">
                    <div
                        class="w-full aspect-square bg-gray-100 border border-gray-300 flex items-center justify-center"
                    >
                        <span class="text-gray-400">Empty Slot</span>
                    </div>
                    <div
                        class="absolute top-0 left-0 w-6 h-6 bg-gray-400 text-white flex items-center justify-center text-sm"
                    >
                        {{ friends.length + i }}
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
interface Friend {
    did: string;
    handle: string;
    displayName: string;
    avatar?: string;
}

defineProps<{
    friends: Friend[];
}>();
</script>
