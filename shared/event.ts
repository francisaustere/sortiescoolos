/** Categories shown as filters in the dashboard. */
export const CATEGORIES = [
  "concert",
  "theatre",
  "slam",
  "spectacle",
  "conference",
  "sciences",
  "festival",
  "nature",
  "makers",
  "expo",
  "cinema",
  "fete",
  "autre",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Venue traits used for scoring and the "pépite" badge. */
export type VenueTag = "tiers_lieu" | "planque" | "militant" | "makers" | "nature" | "institution";

/** Event as produced by an adapter, before normalisation. Dates are ISO strings. */
export interface RawEvent {
  title: string;
  start: string;
  end?: string;
  description?: string;
  url?: string;
  venueName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  image?: string;
  priceText?: string;
  isFree?: boolean;
  keywords?: string[];
  /** Read by OCR or loose text parsing: show a "check it" warning. */
  approximate?: boolean;
}

/** Event as stored in events.json and displayed by the dashboard. */
export interface SortieEvent {
  id: string;
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  description: string;
  url: string | null;
  venueName: string | null;
  address: string | null;
  commune: string;
  image: string | null;
  priceText: string | null;
  isFree: boolean;
  categories: Category[];
  venueTags: VenueTag[];
  score: number;
  scoreReasons: string[];
  sources: { id: string; name: string }[];
  approximate: boolean;
}

/** Useful link shown at the top of the dashboard (e.g. a monthly PDF agenda). */
export interface UsefulLink {
  label: string;
  url: string;
}

/** Recent Reddit post worth a look (no reliable date, shown apart). */
export interface WatchPost {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  sourceName: string;
}

export interface SourceReport {
  id: string;
  name: string;
  kind: string;
  ok: boolean;
  eventCount: number;
  keptCount: number;
  error: string | null;
  usedFallback: boolean;
}

export interface EventsFile {
  generatedAt: string;
  windowDays: number;
  events: SortieEvent[];
  watch: WatchPost[];
  links: UsefulLink[];
  sources: SourceReport[];
}
