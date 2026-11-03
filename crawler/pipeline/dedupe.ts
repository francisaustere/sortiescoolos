import type { SortieEvent } from "@shared/event";
import { normalizeText } from "./text.utils";

function dedupeKey(event: SortieEvent): string {
  return `${event.start.slice(0, 10)}|${normalizeText(event.title).slice(0, 40)}`;
}

/** Merges events seen on several sources (same day + same title): keeps the richest one and all source links. */
export function dedupe(events: SortieEvent[]): SortieEvent[] {
  const byKey = new Map<string, SortieEvent>();
  for (const event of events) {
    const key = dedupeKey(event);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, event);
      continue;
    }
    const richest = event.description.length > existing.description.length ? event : existing;
    const other = richest === event ? existing : event;
    byKey.set(key, {
      ...richest,
      venueName: richest.venueName ?? other.venueName,
      image: richest.image ?? other.image,
      url: richest.url ?? other.url,
      score: Math.max(richest.score, other.score),
      scoreReasons: [...new Set([...richest.scoreReasons, ...other.scoreReasons])],
      venueTags: [...new Set([...richest.venueTags, ...other.venueTags])],
      sources: [...richest.sources, ...other.sources.filter((s) => !richest.sources.some((r) => r.id === s.id))],
    });
  }
  return [...byKey.values()];
}
