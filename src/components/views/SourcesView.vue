<template>
  <div class="SourcesView flex flex-col gap-3">
    <p class="text-sm text-[var(--muted)]">{{ t("sources.intro") }}</p>
    <p class="font-semibold">{{ t("sources.summary", { ok: okCount, total: sources.length }) }}</p>
    <div class="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table class="w-full text-left text-sm">
        <thead class="text-[var(--muted)]">
          <tr>
            <th class="p-3">{{ t("sources.name") }}</th>
            <th class="p-3">{{ t("sources.status") }}</th>
            <th class="p-3 text-right">{{ t("sources.events") }}</th>
            <th class="p-3 text-right">{{ t("sources.kept") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="source in sortedSources" :key="source.id" class="border-t border-[var(--border)] align-top">
            <td class="p-3 font-medium">{{ source.name }}</td>
            <td class="p-3">
              <span :class="source.ok ? 'text-sea' : 'text-brick'">{{ source.ok ? t("sources.ok") : t("sources.ko") }}</span>
              <div v-if="source.usedFallback" class="text-xs text-[var(--muted)]">{{ t("sources.fallback") }}</div>
              <div v-if="source.error" class="text-xs break-all text-[var(--muted)]">{{ source.error }}</div>
            </td>
            <td class="p-3 text-right">{{ source.eventCount }}</td>
            <td class="p-3 text-right">{{ source.keptCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { SourceReport } from "@shared/event";

const props = defineProps<{ sources: SourceReport[] }>();

const { t } = useI18n();

const okCount = computed(() => props.sources.filter((s) => s.ok && s.keptCount > 0).length);
// Broken or empty sources first: that's what needs attention
const sortedSources = computed(() =>
  [...props.sources].sort((a, b) => Number(a.ok && a.keptCount > 0) - Number(b.ok && b.keptCount > 0) || a.name.localeCompare(b.name)),
);
</script>
