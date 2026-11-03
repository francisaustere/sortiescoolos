import { z } from "zod";
import type { WatchPost } from "@shared/event";
import type { Adapter } from "../types";

const MAX_AGE_DAYS = 10;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const SECOND_IN_MS = 1000;
const EVENT_HINTS = /concert|soir[ée]e|festival|expo|spectacle|conf[ée]rence|d[ée]bat|th[ée][âa]tre|slam|balade|atelier|projection|vernissage|bal |sortie|ce week-end|ce soir/i;

const ListingSchema = z.object({
  data: z.object({
    children: z.array(z.object({
      data: z.object({
        id: z.string(),
        title: z.string(),
        permalink: z.string(),
        created_utc: z.number(),
        link_flair_text: z.string().nullable().optional(),
      }),
    })),
  }),
});

/**
 * Reddit posts have no reliable event date, so they feed a separate "à surveiller" list.
 * source.url example: https://www.reddit.com/r/marseille/new.json?limit=100
 */
export function parseRedditListing(json: unknown, sourceName: string, now = Date.now()): WatchPost[] {
  const listing = ListingSchema.parse(json);
  return listing.data.children
    .map((child) => child.data)
    .filter((post) => now - post.created_utc * SECOND_IN_MS < MAX_AGE_DAYS * DAY_IN_MS)
    .filter((post) => EVENT_HINTS.test(post.title) || /[ée]v[ée]nement|sortie|agenda/i.test(post.link_flair_text ?? ""))
    .map((post) => ({
      id: `reddit-${post.id}`,
      title: post.title,
      url: `https://www.reddit.com${post.permalink}`,
      createdAt: new Date(post.created_utc * SECOND_IN_MS).toISOString(),
      sourceName,
    }));
}

const redditAdapter: Adapter = async (source, http) => ({
  events: [],
  watch: parseRedditListing(JSON.parse(await http.getText(source.url)), source.name),
});

export default redditAdapter;
