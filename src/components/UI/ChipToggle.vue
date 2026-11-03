<template>
  <button
    type="button"
    class="ChipToggle rounded-full border px-3 py-1 text-sm transition-colors"
    :class="isActive ? 'border-sea bg-sea text-white' : 'border-[var(--border)] bg-[var(--surface)] hover:border-sea'"
    :aria-pressed="isActive"
    @click="emit('toggle')">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ isActive: boolean }>();
const emit = defineEmits<{ toggle: [] }>();
</script>
