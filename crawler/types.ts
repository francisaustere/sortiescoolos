import type { Category, RawEvent, UsefulLink, VenueTag, WatchPost } from "@shared/event";

export type SourceKind = "auto" | "custom" | "ical" | "jsonld" | "wp-tribe" | "reddit";

export interface SourceConfig {
  readonly id: string;
  readonly name: string;
  readonly kind: SourceKind;
  readonly url: string;
  /** Traits of the venue/organiser, used for scoring. */
  readonly venueTags: VenueTag[];
  /** Categories applied when keyword detection finds nothing. */
  readonly defaultCategories?: Category[];
  /** Venue used when the event carries none (single-venue sources). */
  readonly defaultVenue?: { name: string; address?: string; commune: string };
  /** jsonld only: CSS selector of links to event detail pages to follow when the listing has no JSON-LD. */
  readonly followLinks?: string;
  /** auto only: how many detail pages to follow (default 25). */
  readonly maxFollow?: number;
  /** Aggregators covering a wide area must prove the event is in our communes. */
  readonly requireLocalMatch?: boolean;
  readonly enabled: boolean;
  /** Free note on reliability, why it is disabled, etc. */
  readonly note?: string;
}

export interface AdapterResult {
  events: RawEvent[];
  watch?: WatchPost[];
  /** Extracted text worth saving for writing/refining a reader (e.g. PDF agenda). */
  snapshotText?: string;
  links?: UsefulLink[];
}

export type Adapter = (source: SourceConfig, http: HttpClient) => Promise<AdapterResult>;

export interface HttpClient {
  getText(url: string): Promise<string>;
  getBytes(url: string): Promise<Uint8Array>;
}
