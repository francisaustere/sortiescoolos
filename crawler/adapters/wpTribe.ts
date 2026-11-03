import * as cheerio from "cheerio";
import { z } from "zod";
import type { RawEvent } from "@shared/event";
import type { Adapter } from "../types";

const PER_PAGE = 50;
const MAX_PAGES = 4;

// Subset of The Events Calendar REST API (WordPress plugin used by many associations)
const TribeEventSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
  all_day: z.boolean().optional(),
  cost: z.string().optional(),
  image: z.union([z.object({ url: z.string() }), z.literal(false)]).optional(),
  venue: z.union([
    z.object({ venue: z.string().optional(), address: z.string().optional(), city: z.string().optional(), zip: z.string().optional() }),
    z.array(z.unknown()),
  ]).optional(),
  categories: z.array(z.object({ name: z.string() })).optional(),
});

const TribeResponseSchema = z.object({
  events: z.array(TribeEventSchema),
  next_rest_url: z.string().optional(),
});

function toRawEvent(event: z.infer<typeof TribeEventSchema>): RawEvent {
  const venue = event.venue && !Array.isArray(event.venue) ? event.venue : null;
  const start = event.all_day ? event.start_date.slice(0, 10) : event.start_date;
  return {
    title: cheerio.load(event.title).text(),
    start,
    end: event.end_date,
    description: event.description ? cheerio.load(event.description).text() : undefined,
    url: event.url,
    venueName: venue?.venue,
    address: venue ? [venue.address, venue.zip, venue.city].filter(Boolean).join(", ") : undefined,
    city: venue?.city,
    postalCode: venue?.zip,
    image: event.image ? event.image.url : undefined,
    priceText: event.cost || undefined,
    keywords: event.categories?.map((c) => c.name),
  };
}

export function parseTribeResponse(json: unknown): { events: RawEvent[]; next: string | null } {
  const data = TribeResponseSchema.parse(json);
  return { events: data.events.map(toRawEvent), next: data.next_rest_url ?? null };
}

/** source.url is the WordPress site root, e.g. https://example.org */
const wpTribeAdapter: Adapter = async (source, http) => {
  const today = new Date().toISOString().slice(0, 10);
  let next: string | null = `${source.url.replace(/\/$/, "")}/wp-json/tribe/events/v1/events?per_page=${PER_PAGE}&start_date=${today}`;
  const events: RawEvent[] = [];
  for (let page = 0; next && page < MAX_PAGES; page++) {
    const result = parseTribeResponse(JSON.parse(await http.getText(next)));
    events.push(...result.events);
    next = result.next;
  }
  return { events };
};

export default wpTribeAdapter;
