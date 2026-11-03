<template>
  <div class="WatchView flex flex-col gap-3">
    <p class="text-sm text-[var(--muted)]">{{ t("watch.intro") }}</p>
    <p v-if="posts.length === 0" class="text-[var(--muted)]">{{ t("watch.empty") }}</p>
    <a
      v-for="post in posts"
      :key="post.id"
      :href="post.url"
      target="_blank"
      rel="noopener"
      class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 hover:border-sea">
      <span class="block font-medium">{{ post.title }}</span>
      <span class="text-xs text-[var(--muted)]">{{ post.sourceName }} · {{ formatStamp(post.createdAt) }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { WatchPost } from "@shared/event";
import { formatStamp } from "@/utils/date.utils";

defineProps<{ posts: WatchPost[] }>();

const { t } = useI18n();
</script>
