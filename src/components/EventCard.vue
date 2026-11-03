<template>
  <article
    class="EventCard flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
    :class="{ 'EventCard--coeur': isCoeur(event) }">
    <div class="EventCard__Time w-14 shrink-0 text-sm font-semibold text-sea">
      {{ event.allDay ? "—" : formatTime(event.start) }}
      <div v-if="showDay" class="text-xs font-normal text-[var(--muted)]">{{ dayShort }}</div>
    </div>

    <div class="EventCard__Body min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-1.5 text-xs">
        <span
          v-for="category in event.categories"
          :key="category"
          class="rounded-full bg-sea/10 px-2 py-0.5 text-sea">
          {{ t(`categories.${category}`) }}
        </span>
        <span v-if="isGem(event)" class="rounded-full bg-sun/20 px-2 py-0.5">💎 {{ t("event.gem") }}</span>
        <span v-if="isCoeur(event)" class="rounded-full bg-brick/15 px-2 py-0.5 text-brick">❤️ {{ t("event.coeur") }}</span>
        <span v-if="event.isFree" class="rounded-full border border-[var(--border)] px-2 py-0.5">{{ t("event.free") }}</span>
        <span
          v-if="event.approximate"
          class="rounded-full border border-dashed border-brick px-2 py-0.5 text-brick"
          :title="t('event.approximateHint')">
          {{ t("event.approximate") }}
        </span>
      </div>

      <h3 class="mt-1.5 text-base leading-snug font-semibold">
        <a v-if="event.url" :href="event.url" target="_blank" rel="noopener" class="hover:underline">{{ event.title }}</a>
        <template v-else>{{ event.title }}</template>
      </h3>

      <p v-if="untilLabel" class="mt-0.5 text-xs font-medium text-sea">{{ t("event.until", { date: untilLabel }) }}</p>

      <p class="mt-0.5 text-sm text-[var(--muted)]">
        {{ [event.venueName, event.commune !== "Marseille" ? event.commune : null, event.priceText].filter(Boolean).join(" · ") }}
      </p>

      <p v-if="event.description" class="EventCard__Description mt-2 text-sm">{{ event.description }}</p>

      <p v-if="event.scoreReasons.length > 0" class="mt-2 text-xs text-[var(--muted)]">
        {{ t("event.why", { reasons: event.scoreReasons.join(", ") }) }}
      </p>
      <p v-if="event.sources.length > 1" class="mt-1 text-xs text-[var(--muted)]">
        {{ t("event.alsoOn", { sources: event.sources.map((s) => s.name).join(", ") }) }}
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { SortieEvent } from "@shared/event";
import { isCoeur, isGem } from "@/composables/useFilters";
import { dayKey, formatDayLabel, formatTime } from "@/utils/date.utils";

const props = defineProps<{ event: SortieEvent; showDay?: boolean }>();

const { t } = useI18n();

// Multi-day events (exhibitions, festivals) show their last day
const untilLabel = computed(() => {
  if (!props.event.end) return null;
  const endKey = dayKey(props.event.end);
  return endKey > dayKey(props.event.start) ? formatDayLabel(endKey) : null;
});

const dayShort = computed(() => formatDayLabel(dayKey(props.event.start)).split(" ").slice(0, 3).join(" "));
</script>

<style scoped>
.EventCard--coeur {
  border-left: 4px solid var(--color-brick);
}

.EventCard__Description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
