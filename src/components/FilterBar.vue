<template>
  <section class="FilterBar flex flex-col gap-3">
    <input
      v-model="filters.search"
      type="search"
      class="FilterBar__Search w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 outline-none focus:border-sea"
      :placeholder="t('filters.search')" />

    <div class="FilterBar__Row flex flex-wrap gap-2">
      <ChipToggle
        v-for="period in PERIODS"
        :key="period"
        :is-active="filters.period === period"
        @toggle="filters.period = period">
        {{ t(`filters.period.${period}`) }}
      </ChipToggle>
    </div>

    <div class="FilterBar__Row flex flex-wrap gap-2">
      <ChipToggle
        v-for="category in visibleCategories"
        :key="category"
        :is-active="filters.categories.includes(category)"
        @toggle="emit('toggleCategory', category)">
        {{ t(`categories.${category}`) }}
      </ChipToggle>
    </div>

    <div class="FilterBar__Row flex flex-wrap items-center gap-2">
      <ChipToggle :is-active="filters.onlyCoeur" @toggle="filters.onlyCoeur = !filters.onlyCoeur">❤️ {{ t("filters.coeur") }}</ChipToggle>
      <ChipToggle :is-active="filters.onlyGems" @toggle="filters.onlyGems = !filters.onlyGems">💎 {{ t("filters.gems") }}</ChipToggle>
      <ChipToggle :is-active="filters.onlyFree" @toggle="filters.onlyFree = !filters.onlyFree">{{ t("filters.free") }}</ChipToggle>
      <select
        v-if="communes.length > 1"
        v-model="filters.commune"
        class="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm">
        <option value="">{{ t("filters.commune") }}</option>
        <option v-for="commune in communes" :key="commune" :value="commune">{{ commune }}</option>
      </select>
      <select v-model="filters.sort" class="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm">
        <option value="date">{{ t("filters.sortDate") }}</option>
        <option value="score">{{ t("filters.sortScore") }}</option>
      </select>
      <button type="button" class="text-sm text-[var(--muted)] underline" @click="emit('reset')">{{ t("filters.reset") }}</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { CATEGORIES, type Category } from "@shared/event";
import ChipToggle from "@/components/UI/ChipToggle.vue";
import type { Filters, Period } from "@/composables/useFilters";

const props = defineProps<{ filters: Filters; communes: string[]; presentCategories: Set<Category> }>();
const emit = defineEmits<{ toggleCategory: [category: Category]; reset: [] }>();

const { t } = useI18n();

const PERIODS: Period[] = ["week", "weekend", "next", "all"];

// Only offer categories that actually exist in the data (plus selected ones)
const visibleCategories = computed(() =>
  CATEGORIES.filter((c) => props.presentCategories.has(c) || props.filters.categories.includes(c)),
);
</script>
