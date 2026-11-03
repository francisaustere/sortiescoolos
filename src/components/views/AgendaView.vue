<template>
  <div class="AgendaView flex flex-col gap-6">
    <FilterBar
      :filters="filters"
      :communes="communes"
      :present-categories="presentCategories"
      @toggle-category="toggleCategory"
      @reset="reset" />

    <p class="text-sm text-[var(--muted)]">{{ t("filters.count", filtered.length) }}</p>

    <p v-if="filtered.length === 0" class="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--muted)]">
      {{ t("empty") }}
    </p>

    <section v-for="group in groups" :key="group.key" class="AgendaView__Day flex flex-col gap-3">
      <h2 v-if="group.key" class="sticky top-0 z-10 bg-[var(--bg)]/95 py-2 text-lg font-bold capitalize backdrop-blur">
        {{ formatDayLabel(group.key) }}
      </h2>
      <EventCard
        v-for="event in group.events"
        :key="event.id"
        :event="event"
        :show-day="!group.key" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useI18n } from "vue-i18n";
import type { Category, EventsFile } from "@shared/event";
import EventCard from "@/components/EventCard.vue";
import FilterBar from "@/components/FilterBar.vue";
import { useFilters } from "@/composables/useFilters";
import { formatDayLabel } from "@/utils/date.utils";

const props = defineProps<{ data: EventsFile }>();

const { t } = useI18n();
const { filters, communes, filtered, groups, toggleCategory, reset } = useFilters(toRef(props, "data"));

const presentCategories = computed(() => new Set<Category>(props.data.events.flatMap((e) => e.categories)));
</script>
