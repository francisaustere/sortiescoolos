import { createHash } from "node:crypto";
import type { RawEvent, SortieEvent } from "@shared/event";
import type { SourceConfig } from "../types";
import { isDateOnly, toUtcIso } from "../utils/date.utils";
import { classify } from "./classify";
import { resolveCommune } from "./geo";
import { score } from "./score";
import { shortenDescription } from "./text.utils";

const FREE_PATTERN = /gratuit|entr[ée]e libre|prix libre|participation libre/i;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
/** Listings that are services or internal meetings, not outings. */
const NOT_A_SORTIE = /^(permanences?|r[ée]union (interne|de bureau|d'[ée]quipe)|assembl[ée]e g[ée]n[ée]rale|inscriptions?)\b/i;
/** Multi-day events (exhibitions, festivals) longer than this are kept but shown once, at the window start. */
const LONG_EVENT_DAYS = 3;

export interface Window {
  from: Date;
  to: Date;
}

/** Turns a raw adapter event into a dashboard event, or null if it is out of the time or geographic window. */
export function normalize(raw: RawEvent, source: SourceConfig, window: Window): SortieEvent | null {
  const title = raw.title.replace(/\s+/g, " ").trim();
  if (!title || NOT_A_SORTIE.test(title)) return null;

  const allDay = isDateOnly(raw.start);
  const start = toUtcIso(raw.start);
  if (!start) return null;
  const end = raw.end ? toUtcIso(raw.end) : null;

  // Keep events that overlap the window
  const startMs = Date.parse(start);
  const endMs = end ? Date.parse(end) : startMs + (allDay ? DAY_IN_MS : 0);
  if (endMs < window.from.getTime() || startMs > window.to.getTime()) return null;
  const isLong = endMs - startMs > LONG_EVENT_DAYS * DAY_IN_MS;
  const displayStart = isLong && startMs < window.from.getTime() ? window.from.toISOString() : start;

  // Geography: explicit address wins; otherwise single-venue sources are trusted
  const resolved = resolveCommune(raw);
  if (resolved === "excluded") return null;
  const commune = resolved ?? source.defaultVenue?.commune ?? null;
  if (!commune) {
    if (source.requireLocalMatch) return null;
  }

  const description = shortenDescription(raw.description);
  const isFree = raw.isFree ?? FREE_PATTERN.test(`${raw.priceText ?? ""} ${title} ${description}`);
  const categories = classify(title, description, raw.keywords, source.defaultCategories);
  const scored = score({ title, description, categories, venueTags: source.venueTags, isFree });

  const id = createHash("sha1").update(`${source.id}|${title}|${start}`).digest("hex").slice(0, 12);
  return {
    id,
    title,
    start: displayStart,
    end,
    allDay,
    description,
    url: raw.url ?? null,
    venueName: raw.venueName ?? source.defaultVenue?.name ?? null,
    address: raw.address ?? source.defaultVenue?.address ?? null,
    commune: commune ?? "Marseille",
    image: raw.image ?? null,
    priceText: raw.priceText ?? null,
    isFree,
    categories,
    venueTags: source.venueTags,
    score: scored.score,
    scoreReasons: scored.reasons,
    sources: [{ id: source.id, name: source.name }],
  };
}
