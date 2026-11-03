import { ref } from "vue";
import type { EventsFile } from "@shared/event";

const DATA_URL = `${import.meta.env.BASE_URL}data/events.json`;

/** Loads the weekly snapshot produced by the crawler. */
export function useEvents() {
  const data = ref<EventsFile | null>(null);
  const error = ref<string | null>(null);
  const isLoading = ref(true);

  fetch(DATA_URL, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<EventsFile>;
    })
    .then((file) => {
      data.value = file;
    })
    .catch((reason: unknown) => {
      console.error("[useEvents] load failed", reason);
      error.value = reason instanceof Error ? reason.message : String(reason);
    })
    .finally(() => {
      isLoading.value = false;
    });

  return { data, error, isLoading };
}
