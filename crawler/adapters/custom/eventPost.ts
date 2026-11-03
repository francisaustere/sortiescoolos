import * as cheerio from "cheerio";
import type { RawEvent } from "@shared/event";

/** WordPress "Event Post" plugin (Vidéodrome 2): .event_item with h5 title and time[itemprop=dtstart]. */
export function parseEventPost(html: string, baseUrl: string): RawEvent[] {
  const $ = cheerio.load(html);
  const events: RawEvent[] = [];
  $(".event_item").each((_, element) => {
    const item = $(element);
    const start = item.find("time[itemprop='dtstart']").attr("datetime");
    const title = item.find("h5, h3, h2").first().text().trim();
    if (!title || !start) return;
    const href = item.find("a[href]").first().attr("href");
    events.push({
      title,
      start,
      url: href ? new URL(href, baseUrl).toString() : undefined,
      image: item.find("img").attr("data-orig-file") ?? item.find("img").attr("src"),
      keywords: item.find(".event_categories").text().split(",").map((k) => k.trim()).filter(Boolean),
    });
  });
  return events;
}
