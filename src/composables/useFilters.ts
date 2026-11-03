import { computed, reactive, watch, type Ref } from "vue";
import type { Category, EventsFile, SortieEvent } from "@shared/event";
import { COUP_DE_COEUR_THRESHOLD } from "@shared/taste";
import { dayKey, periodRange } from "@/utils/date.utils";

export type Period = "week" | "weekend" | "next" | "all";
export type SortMode = "date" | "score";

export interface Filters {
  search: string;
  period: Period;
  categories: Category[];
  commune: string;
  onlyFree: boolean;
  onlyCoeur: boolean;
  onlyGems: boolean;
  sort: SortMode;
}

const STORAGE_KEY = "sorties-filters-v1";

const DEFAULT_FILTERS: Filters = {
  search: "", period: "week", categories: [], commune: "", onlyFree: false, onlyCoeur: false, onlyGems: false, sort: "date",
};

function loadFilters(): Filters {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_FILTERS, ...(JSON.parse(saved) as Partial<Filters>), search: "" } : { ...DEFAULT_FILTERS };
  } catch {
    return { ...DEFAULT_FILTERS };
  }
}

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function isGem(event: SortieEvent): boolean {
  return event.venueTags.includes("planque");
}

export function isCoeur(event: SortieEvent): boolean {
  return event.score >= COUP_DE_COEUR_THRESHOLD;
}

/** Filter state (remembered per browser) and the filtered, grouped event list. */
export function useFilters(data: Ref<EventsFile | null>) {
  const filters = reactive<Filters>(loadFilters());

  watch(filters, (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Private mode: filters simply won't be remembered
    }
  });

  const communes = computed(() => [...new Set((data.value?.events ?? []).map((e) => e.commune))].sort());

  const filtered = computed(() => {
    const range = periodRange(filters.period);
    const query = normalize(filters.search.trim());
    const list = (data.value?.events ?? []).filter((event) => {
      const key = dayKey(event.start);
      if (range && (key < range[0] || key > range[1])) return false;
      if (filters.categories.length > 0 && !event.categories.some((c) => filters.categories.includes(c))) return false;
      if (filters.commune && event.commune !== filters.commune) return false;
      if (filters.onlyFree && !event.isFree) return false;
      if (filters.onlyCoeur && !isCoeur(event)) return false;
      if (filters.onlyGems && !isGem(event)) return false;
      if (!query) return true;
      return normalize(`${event.title} ${event.venueName ?? ""} ${event.description} ${event.scoreReasons.join(" ")}`).includes(query);
    });
    return filters.sort === "score"
      ? [...list].sort((a, b) => b.score - a.score || a.start.localeCompare(b.start))
      : list;
  });

  /** Grouped by day when sorting by date; a single group otherwise. */
  const groups = computed(() => {
    if (filters.sort === "score") return [{ key: "", events: filtered.value }];
    const byDay = new Map<string, SortieEvent[]>();
    for (const event of filtered.value) {
      const key = dayKey(event.start);
      byDay.set(key, [...(byDay.get(key) ?? []), event]);
    }
    return [...byDay.entries()].map(([key, events]) => ({ key, events }));
  });

  function toggleCategory(category: Category): void {
    const index = filters.categories.indexOf(category);
    if (index >= 0) filters.categories.splice(index, 1);
    else filters.categories.push(category);
  }

  function reset(): void {
    Object.assign(filters, { ...DEFAULT_FILTERS, categories: [] });
  }

  return { filters, communes, filtered, groups, toggleCategory, reset };
}
