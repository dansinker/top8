<!-- components/profile/ProfileCard.vue -->
<template>
    <table class="w-full border border-gray-300">
        <tr>
            <td class="bg-[#003399] text-white font-bold p-2">
                {{ title }}
            </td>
        </tr>
        <tr>
            <td class="p-4">
                <slot />
            </td>
        </tr>
    </table>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
}>();
</script>
